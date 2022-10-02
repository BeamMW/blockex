from django.shortcuts import render


from .models import *

from django.db import IntegrityError

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import HTTP_200_OK
import requests
import json

import pandas as pd
import numpy as np
from io import StringIO
from contextlib import closing
import csv
import os

import pytz


from celery import shared_task
from celery.schedules import crontab
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count
from django.db.models import Sum, Avg
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from .serializers import *
import redis
import time
import io

from datetime import datetime, timedelta
from django.utils import timezone
from pycoingecko import CoinGeckoAPI
from django.db.models import Max

BEAM_NODE_API = os.environ.get('NODE_API_URL')
BLOCKS_STEP_SYNC = 1000
HEIGHT_STEP = 43800
BLOCKS_PER_DAY = 1440
MONTHS_IN_YEAR = 12
FIRST_YEAR_VALUE = 20
REST_YEARS_VALUE = 10
BLOCKS_STEP = 100

TELEGRAM_URL = "https://api.telegram.org/bot"
_redis = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)


# Create your views here.
def fast_sync(limit=None):
    last_height = _redis.get('beam_blockex_last_height')

    if last_height:
        last_height = int(last_height) + 1

    if not last_height:
        try:
            last_block = Block.objects.latest('height')
            last_height = (last_block.height + 1) if last_block else 1
        except ObjectDoesNotExist:
            last_height = 1
    height_from_end = 0

    # Get last blockchain height
    r = requests.get(BEAM_NODE_API + '/status')

    current_height = int(r.json()['height'])

    bid = 1
    inputs = []
    load_until = current_height + BLOCKS_STEP_SYNC
    if limit != None:
        load_until = limit

    while (last_height < load_until):
        height_dif = current_height - last_height
        
        from_height = last_height
        r = requests.get(BEAM_NODE_API + '/blocks?height=' + str(from_height) + '&n=' + str(BLOCKS_STEP_SYNC))
        blocks = r.json()
        
        _inputs = []
        _outputs = []
        _kernels = []

        for _block in blocks:
            del _block['assets']
            del _block['found']

            if _block['inputs'] is not None:
                for _input in _block['inputs']:
                    _input['block'] = bid
                    _inputs.append(_input)

            if _block['outputs'] is not None:
                for _output in _block['outputs']:
                    _output['block'] = bid
                    _outputs.append(_output)

            fee = 0
            if _block['kernels'] is not None:
                for _kernel in _block['kernels']:
                    _kernel['block'] = bid
                    fee = fee + _kernel['fee']
                    _kernel['kernel_id'] = _kernel['id']
                    del _kernel['id']
                    _kernels.append(_kernel)

            _block['fee'] = fee
            _block['timestamp'] = datetime.utcfromtimestamp(_block['timestamp']).replace(tzinfo=pytz.utc)

            bid = bid + 1
        df = pd.DataFrame(blocks)
        df.to_csv('out.csv', columns=['chainwork', 'difficulty', 'hash', 'height', 'prev', 
        'rate_btc', 'rate_usd', 'subsidy', 'timestamp'], index=False)
        Block.objects.from_csv('out.csv')
        os.remove("out.csv")

        if len(_kernels) > 0:
            df_kernels = pd.DataFrame(_kernels)
            df_kernels.to_csv('kernels.csv', index=False, columns=['minHeight', 'maxHeight', 'kernel_id', 'fee', 'block'])
            Kernel.objects.from_csv('kernels.csv')
            os.remove("kernels.csv")

        if len(_inputs) > 0:
            df_inputs = pd.DataFrame(_inputs)
            df_inputs.to_csv('inputs.csv', index=False, columns=['block', 'commitment', 'height'])
            Input.objects.from_csv('inputs.csv')
            os.remove("inputs.csv")

        if len(_outputs) > 0:
            df_outputs = pd.DataFrame(_outputs)
            df_outputs.to_csv('outputs.csv', index=False, columns=['block', 'commitment'])
            Output.objects.from_csv('outputs.csv')
            os.remove("outputs.csv")
        
        last_height += BLOCKS_STEP_SYNC
        print('DONE', blocks[0]['height'])
        height_from_end = blocks[0]['height']


    print('FINISHED')

    _redis.set('beam_blockex_last_height', height_from_end)
    return Response({'done': True}, status=HTTP_200_OK)


def fast_sync_contracts():
    print('CONTRACT SYNC START')
    r = requests.get(BEAM_NODE_API + '/contracts')
    contracts = r.json()

    c_count = 1
    for _contract in contracts:
        if 'subtype' not in _contract:
            _contract['subtype'] = ''
        c = requests.get(BEAM_NODE_API + '/contract?id=' + str(_contract['cid']))
        c_data = c.json()

        _funds = []
        for _fund in c_data['funds']:
            _fund['contract'] = c_count
            _fund['value'] = str(_fund['value'])
            _funds.append(_fund)

        if len(_funds) > 0:
            df_funds = pd.DataFrame(_funds)
            df_funds.to_csv('funds.csv', index=False, columns=['contract', 'aid', 'value'])
            Contract_funds.objects.from_csv('funds.csv')
            os.remove("funds.csv")
        
        _calls = []
        for _call in c_data['calls']:
            if 'parent' in _call:
                continue
            else:
                call = {}
                call['contract'] = c_count
                call['height'] = _call['height']
                if 'name' in _call['contract']:
                    call['cname'] = _call['contract']['name']
                else:
                    call['cname'] = ''
                if 'iMethod' in _call['contract']:
                    call['imethod'] = _call['contract']['iMethod']
                else:
                    call['imethod'] = 999
                if 'nested' in _call['contract'] and 'method' in _call['contract']['nested'][0]:
                    call['methodname'] = _call['contract']['nested'][0]['method']
                else:
                    call['methodname'] = ''
                if 'funds' in _call['contract']:
                    call['faction'] = _call['contract']['funds'][0]['action']
                    call['fval'] = str(_call['contract']['funds'][0]['val'])
                else:
                    call['faction'] = ''
                    call['fval'] = ''

                _calls.append(call)

        if len(_calls) > 0:
            df_calls = pd.DataFrame(_calls)
            df_calls.to_csv('calls.csv', index=False, columns=['contract', 'height', 'cname', 'imethod', 'methodname', 'faction', 'fval'])
            Contract_calls.objects.from_csv('calls.csv')
            os.remove("calls.csv")
        
        c_count = c_count + 1

        print('Contract loaded: ', _contract['cid'])

    df_contracts = pd.DataFrame(contracts)
    df_contracts.to_csv('contracts.csv', index=False, columns=['cid', 'height', 'sid', 'name', 'subtype'])
    Contract.objects.from_csv('contracts.csv')
    os.remove("contracts.csv")

    print('CONTRACT SYNC END')


def load_token():
    settings_dir = os.path.dirname(__file__)
    proj_root = os.path.abspath(os.path.dirname(settings_dir))
    with open(os.path.join(proj_root)+'/token.json') as token_file:
        data = json.load(token_file)
    return data['token']


def send_message(message, chat_id):
    data = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
    }
    requests.post(
        f"{TELEGRAM_URL}{load_token()}/sendMessage", data=data
    )

def send_message_to_all(value):
    users = Bot_users.objects.all()
    for user in users:
        send_message(value, user.external_id)


def send_multi_height_report(from_value, to_value):
    diff = to_value - from_value
    if diff > 5:
        users = Bot_users.objects.all()
        if not Rollback_reports.objects.filter(height_from=from_value, height_to=to_value).exists():
            for user in users:
                send_message(bytes.decode(b'\xE2\x9D\x97', 'utf8')+
                    'Rollback alert! Detected from '+
                    str(from_value)+
                    ' to '+
                    str(to_value)+
                    ' heights. Rollback depth='+
                    str(to_value-from_value+1), user.external_id)
            reports = Rollback_reports()
            reports.from_json({'from': from_value, 'to': to_value})
            reports.save()


@shared_task(name="bot_check", ignore_result=True)
def bot_check():
    try:
        r = requests.get(BEAM_NODE_API + '/status')
    except requests.exceptions.RequestException as e:
        send_message_to_all('Node is not available. Reason: '+str(e))
        return

    current_height = r.json()['height']
    last_block = r.json()

    millisec_last = last_block['timestamp'] * 1000
    date_now = int(round(time.time() * 1000))

    millisec_dif = date_now - millisec_last
    if millisec_dif >= 600000:
        seconds=(millisec_dif/1000)%60
        seconds = int(seconds)
        minutes=(millisec_dif/(1000*60))%60
        minutes = int(minutes)

        if _redis.get('delay_alert') != 'sended':
            send_message_to_all(bytes.decode(b'\xE2\x9D\x97', 'utf8')+
                'Block delay alert! '+str(minutes)+' min '+str(seconds)+
                ' sec. Last block height: '+str(current_height))
            _redis.set('delay_alert', 'sended')
    else: 
        _redis.delete('delay_alert')
        
    rollback_heights = Forks_event_detection.objects.all().order_by('height')
    if rollback_heights.count() > 0:
        r_tmp_height = rollback_heights[0]
        counter = 0
        index = 0
        r_first_height = 0
        for r_height in rollback_heights:
            if index != 0:
                height_dif = r_height.height - r_tmp_height.height
                is_end_of_rollbacks = index == (rollback_heights.count() - 1)
                
                if height_dif > 1 and not is_end_of_rollbacks:
                    if counter > 0:
                        send_multi_height_report(r_first_height, r_tmp_height.height)
                        r_first_height = r_height.height
                    elif counter == 0:
                        r_first_height = r_height.height
                    counter = 0
                elif height_dif > 1 and is_end_of_rollbacks:
                    if counter > 0:
                        send_multi_height_report(r_first_height, r_tmp_height.height)
                elif height_dif == 1 and is_end_of_rollbacks:
                    if counter > 0:
                        send_multi_height_report(r_first_height, r_height.height)
                elif height_dif == 1 and not is_end_of_rollbacks:
                    if counter == 0:
                        r_first_height = r_tmp_height.height
                    counter += 1
                r_tmp_height = r_height
            index += 1
    return True


def update_status():
    last_block = Block.objects.latest('height')
    subsidy_data = Block.objects.all().aggregate(Sum('subsidy'))

    data = {
        "difficulty": last_block.difficulty,
        "height": last_block.height,
        "timestamp": last_block.timestamp
    }

    coins_in_circulation_mined = int(subsidy_data['subsidy__sum']) * 10**-8
    _redis.set('coins_in_circulation_mined', coins_in_circulation_mined)
    data['coins_in_circulation_mined'] = coins_in_circulation_mined

    coins_in_circulation_treasury = _redis.get('coins_in_circulation_treasury')
    data['coins_in_circulation_treasury'] = coins_in_circulation_treasury
    
    data['total_coins_in_circulation'] = float(coins_in_circulation_mined) + float(coins_in_circulation_treasury)
    _redis.set('total_coins_in_circulation', data['total_coins_in_circulation'])
    data['next_treasury_emission_block_height'] = _redis.get('next_treasury_emission_height')
    data['next_treasury_emission_coin_amount'] = _redis.get('next_treasury_coin_amount')
    data['total_emission'] = _redis.get('total_coins_emission')

    cg = CoinGeckoAPI()
    cg_data = cg.get_price(ids=['bitcoin',
        'dash',
        'dogecoin',
        'litecoin',
        'qtum',
        'dai',
        'wrapped-bitcoin',
        'ethereum',
        'tether'], vs_currencies=['usd', 'btc'])

    daily_swaps = Swaps_daily_stats.objects.all()

    swaps_stats = {
        "btc": 0,
        "dash": 0,
        "doge": 0,
        "ltc": 0,
        "qtum": 0,
        "dai": 0,
        "usdt": 0,
        "eth": 0,
        "wbtc": 0,
    }

    if daily_swaps:
        for swap_info in daily_swaps:
            swaps_stats[swap_info.swap_currency.lower()] += float(swap_info.swap_amount)

    swaps_stats_usd = {
        "bitcoin": swaps_stats["btc"] * cg_data["bitcoin"]["usd"],
        "dash": swaps_stats["dash"] * cg_data["dash"]["usd"],
        "dogecoin": swaps_stats["doge"] * cg_data["dogecoin"]["usd"],
        "litecoin": swaps_stats["ltc"] * cg_data["litecoin"]["usd"],
        "qtum": swaps_stats["qtum"] * cg_data["qtum"]["usd"],
        "wbtc": swaps_stats["wbtc"] * cg_data["wrapped-bitcoin"]["usd"],
        "eth": swaps_stats["eth"] * cg_data["ethereum"]["usd"],
        "usdt": swaps_stats["usdt"] * cg_data["tether"]["usd"],
        "dai": swaps_stats["dai"] * cg_data["dai"]["usd"]
    }
    swaps_stats_sum_usd = sum(swaps_stats_usd.values())

    swaps_stats_btc = {
        "bitcoin": swaps_stats["btc"] * cg_data["bitcoin"]["btc"],
        "dash": swaps_stats["dash"] * cg_data["dash"]["btc"],
        "dogecoin": swaps_stats["doge"] * cg_data["dogecoin"]["btc"],
        "litecoin": swaps_stats["ltc"] * cg_data["litecoin"]["btc"],
        "qtum": swaps_stats["qtum"] * cg_data["qtum"]["btc"],
        "wbtc": swaps_stats["wbtc"] * cg_data["wrapped-bitcoin"]["btc"],
        "eth": swaps_stats["eth"] * cg_data["ethereum"]["btc"],
        "usdt": swaps_stats["usdt"] * cg_data["tether"]["btc"],
        "dai": swaps_stats["dai"] * cg_data["dai"]["btc"]
    }
    swaps_stats_sum_btc = sum(swaps_stats_btc.values())

    data['swaps_stats_btc'] = swaps_stats_btc
    data['swaps_stats_sum_btc'] = swaps_stats_sum_btc
    data['swaps_stats_usd'] = swaps_stats_usd
    data['swaps_stats_sum_usd'] = swaps_stats_sum_usd

    _redis.set('status', json.dumps(data, default=str))
    
    return data


# @shared_task(name="update_contracts", ignore_result=True)
def update_contracts():
    r = requests.get(BEAM_NODE_API + '/contracts')
    contracts = r.json()

    for _contract in contracts:
        try:
            # existing contract
            contract_obj = Contract.objects.get(cid=_contract['cid'])
           
        except ObjectDoesNotExist:
            # new contract
            c = requests.get(BEAM_NODE_API + '/contract?id=' + str(_contract['cid']))
            cont = Contract()
            if 'name' not in _contract:
                _contract['name'] = ''
            if 'subtype' not in _contract:
                _contract['subtype'] = ''
            if 'sid' not in _contract:
                _contract['sid'] = ''
            cont.from_json(_contract)
            cont.save()

            c_data = c.json()

            if len(c_data['funds']) > 0:
                for _fund in c_data['funds']:
                    cf = Contract_funds()
                    cf.from_json(_fund)
                    cf.contract = cont
                    cf.save()
    return True    


@shared_task(name="update_blockchain", ignore_result=True)
def update_blockchain():
    # # Find last seen height
    last_height = _redis.get('beam_blockex_last_height')

    if not last_height:
        try:
            last_block = Block.objects.latest('height')
            last_height = last_block.height if last_block else 1
        except ObjectDoesNotExist:
            last_height = 1

    last_height = int(last_height)

    # Get last blockchain height
    r = requests.get(BEAM_NODE_API + '/status')

    current_height = int(r.json()['height'])

    # current_height = last_height

    # Total emission
    total_coins_emission = _redis.get('total_coins_emission')

    if not total_coins_emission:
        total_coins_emission = HEIGHT_STEP * 60 * 100
        _redis.set('total_coins_emission', total_coins_emission)

    # Next treasury emission block height

    current_height_step_amount = current_height // HEIGHT_STEP
    last_height_step_amount = last_height // HEIGHT_STEP

    next_treasury_emission_height = _redis.get('next_treasury_emission_height')
    if not next_treasury_emission_height or (current_height_step_amount > last_height_step_amount):
        next_treasury_emission_height = (current_height_step_amount + 1) * HEIGHT_STEP
        _redis.set('next_treasury_emission_height', next_treasury_emission_height)

    # Coins in circulation treasury

    coins_in_circulation_treasury = _redis.get('coins_in_circulation_treasury')
    if (not coins_in_circulation_treasury) or (current_height_step_amount > last_height_step_amount):
        if current_height_step_amount >= MONTHS_IN_YEAR:
            coins_in_circulation_treasury = MONTHS_IN_YEAR * FIRST_YEAR_VALUE * HEIGHT_STEP + \
                                            (current_height_step_amount - MONTHS_IN_YEAR) * REST_YEARS_VALUE * HEIGHT_STEP
        else:
            coins_in_circulation_treasury = current_height_step_amount * FIRST_YEAR_VALUE * HEIGHT_STEP
        _redis.set('coins_in_circulation_treasury', coins_in_circulation_treasury)

    # Next treasury emission coin amount

    next_treasury_coin_amount = _redis.get('next_treasury_coin_amount')
    if (not next_treasury_coin_amount) or (current_height_step_amount > last_height_step_amount):

        if current_height_step_amount >= MONTHS_IN_YEAR:
            next_treasury_coin_amount = REST_YEARS_VALUE * HEIGHT_STEP
        else:
            next_treasury_coin_amount = FIRST_YEAR_VALUE * HEIGHT_STEP
        _redis.set('next_treasury_coin_amount', next_treasury_coin_amount)

    # Retrieve missing blocks in 100 block pages

    print('LAST HEIGHT: ', last_height)

    while (last_height < current_height + BLOCKS_STEP):
        height_dif = current_height - last_height
        n = BLOCKS_PER_DAY
        from_height = last_height - BLOCKS_PER_DAY

        r = requests.get(BEAM_NODE_API + '/blocks?height=' + str(from_height) + '&n=' + str(n))
        
        blocks = r.json()
        _inputs = []
        _outputs = []
        _kernels = []
        fork_detected = False
        
        for _block in blocks:

            if 'found' in _block and _block['found'] is False:
                continue

            new_block = False
            try:
                cached_block = Block.objects.get(height=_block['height'])
            except ObjectDoesNotExist:
                new_block = True

            if not new_block:
                if cached_block and fork_detected == False:
                    if cached_block.hash != _block['hash']:
                        fork_detected = True
                        fd = Forks_event_detection()
                        fd.from_json(_block['height'])
                        fd.save()

                        cached_block.delete()
                
                if cached_block and fork_detected == True:
                    cached_block.delete()

                if cached_block and fork_detected == False:
                    continue
            
            b = Block()
            b.from_json(_block)

            fee = 0.0

            try:
                b.save()
            except IntegrityError:
                b = Block.objects.get(height=b.height)
                continue

            for _input in _block['inputs']:
                i = Input()
                i.from_json(_input)
                i.block = b
                _inputs.append(i)

            for _output in _block['outputs']:
                o = Output()
                o.from_json(_output)
                o.block = b
                _outputs.append(o)

            for _kernel in _block['kernels']:
                k = Kernel()
                k.from_json(_kernel)

                fee = fee + k.fee

                k.block = b
                _kernels.append(k)

            b.fee = fee
            b.save()

        last_height += 100

        if len(_inputs) > 0:
            Input.objects.bulk_create(_inputs)
        if len(_outputs) > 0:
            Output.objects.bulk_create(_outputs)
        if len(_kernels) > 0:
            Kernel.objects.bulk_create(_kernels)

    _redis.set('beam_blockex_last_height', current_height)

    update_contracts()
    return True


@shared_task(name="update_charts", ignore_result=True)
def update_charts():
    cg = CoinGeckoAPI()
    cg_data = cg.get_price(ids=[
        'bitcoin',
        'dash',
        'dogecoin',
        'litecoin',
        'qtum',
        'dai',
        'wrapped-bitcoin',
        'ethereum',
        'tether'], vs_currencies=['usd', 'btc'])
    
    # get data for blocks
    latest_block = Block.objects.latest('height')
    latest_block_height = int(latest_block.height)
    from_height = int(latest_block_height) - 4 * 1440
    to_height = int(latest_block_height) + 1

    blocks = Block.objects.filter(height__gte=from_height, height__lt=to_height).order_by('height')
    hour_offset = timedelta(hours=int(2))
    start_date = blocks.first().timestamp
    end_date = blocks.last().timestamp

    date_with_offset = end_date - hour_offset

    result = {
        'items': [],
        'avg_blocks': 0,
        'lelantus': [],
        'lelantus_trs': [],
        'swap_stats': []
    }

    lelantus_data = Max_privacy_withdraw.objects.filter(created_at__gte=start_date, created_at__lt=end_date).order_by('created_at')
    swap_data = Swap_stats.objects.filter(created_at__gte=start_date, created_at__lt=end_date).order_by('created_at')
    
    while end_date > start_date:
        #blocks info start
        offset_blocks = blocks.filter(timestamp__gte=date_with_offset, timestamp__lt=end_date)
        blocks_count = offset_blocks.count() / 2

        fee = 0
        diff = 0
        hashrate = 0
        transactions = 0
        date = date_with_offset
        if blocks_count != 0:
            dif_avg_value = offset_blocks.aggregate(Avg('difficulty'))['difficulty__avg']
            if dif_avg_value:
                diff = dif_avg_value
            if diff:
                hashrate = diff / 60
            fee_sum_value = offset_blocks.aggregate(Sum('fee'))['fee__sum']
            if fee_sum_value:
                fee = fee_sum_value
            last_block_value = offset_blocks.last()
            if last_block_value:
                date = last_block_value.timestamp
            transactions_count = offset_blocks.aggregate(Count('kernels'))
            if transactions_count:
                transactions = transactions_count
        
        result['items'].insert(0, {
            'fee': fee,
            'difficulty': diff,
            'hashrate': hashrate,
            'date': date,
            'blocks_count': blocks_count,
            'transactions': transactions
        })
        #block info end

        #lelantus info start
        offset_lelantus = lelantus_data.filter(created_at__gte=date_with_offset, created_at__lt=end_date)

        if offset_lelantus:
            lelantus_count = offset_lelantus.count()

            lelantus_sum = 0
            for data in offset_lelantus:
                try:
                    lelantus_sum += float(data.value)
                except ValueError:
                    lelantus_sum += 0
            lelantus_avg = lelantus_sum / lelantus_count
            if lelantus_avg == 0 or lelantus_avg > 72:
                lelantus_avg = 72   
            result['lelantus'].insert(0, [date, lelantus_avg])
            result['lelantus_trs'].insert(0, [date, float(offset_lelantus.last().per_day)])
        #lelantus info end

        #swaps info start
        offset_swaps = swap_data.filter(created_at__gte=date_with_offset, created_at__lt=end_date)
        swap_item = {
            "btc": offset_swaps.aggregate(Max('btc')),
            "dash": offset_swaps.aggregate(Max('dash')),
            "dogecoin": offset_swaps.aggregate(Max('doge')),
            "litecoin": offset_swaps.aggregate(Max('ltc')),
            "qtum": offset_swaps.aggregate(Max('qtum')),
            "wbtc": offset_swaps.aggregate(Max('wbtc')),
            "eth": offset_swaps.aggregate(Max('eth')),
            "usdt": offset_swaps.aggregate(Max('usdt')),
            "dai": offset_swaps.aggregate(Max('dai'))
        }

        if swap_item and swap_item["btc"]["btc__max"] != None:
            swap_usd = {
                "bitcoin": float(swap_item["btc"]["btc__max"]) * cg_data["bitcoin"]["usd"],
                "dash": float(swap_item["dash"]["dash__max"]) * cg_data["dash"]["usd"],
                "dogecoin": float(swap_item["dogecoin"]["doge__max"]) * cg_data["dogecoin"]["usd"],
                "litecoin": float(swap_item["litecoin"]["ltc__max"]) * cg_data["litecoin"]["usd"],
                "qtum": float(swap_item["qtum"]["qtum__max"]) * cg_data["qtum"]["usd"],
                "wbtc": float(swap_item["wbtc"]["wbtc__max"]) * cg_data["wrapped-bitcoin"]["usd"],
                "eth": float(swap_item["eth"]["eth__max"]) * cg_data["ethereum"]["usd"],
                "usdt": float(swap_item["usdt"]["usdt__max"]) * cg_data["tether"]["usd"],
                "dai": float(swap_item["dai"]["dai__max"]) * cg_data["dai"]["usd"],
            }

            swap_btc = {
                "bitcoin": float(swap_item["btc"]["btc__max"]) * cg_data["bitcoin"]["btc"],
                "dash": float(swap_item["dash"]["dash__max"]) * cg_data["dash"]["btc"],
                "dogecoin": float(swap_item["dogecoin"]["doge__max"]) * cg_data["dogecoin"]["btc"],
                "litecoin": float(swap_item["litecoin"]["ltc__max"]) * cg_data["litecoin"]["btc"],
                "qtum": float(swap_item["qtum"]["qtum__max"]) * cg_data["qtum"]["btc"],
                "wbtc": float(swap_item["wbtc"]["wbtc__max"]) * cg_data["wrapped-bitcoin"]["btc"],
                "eth": float(swap_item["eth"]["eth__max"]) * cg_data["ethereum"]["btc"],
                "usdt": float(swap_item["usdt"]["usdt__max"]) * cg_data["tether"]["btc"],
                "dai": float(swap_item["dai"]["dai__max"]) * cg_data["dai"]["btc"],
            }
        
            result['swap_stats'].insert(0, [date, {"usd": swap_usd, "btc": swap_btc}])

        #swaps info end

        end_date = date_with_offset
        date_with_offset -= hour_offset

    result['avg_blocks'] = (blocks.count() / len(result['items'])) / 2
    result['items'].pop(0)
    if len(result['lelantus_trs']) > 0:
        result['lelantus_trs'].pop(0)

    _redis.set('graph_data', json.dumps(result, default=str))
    return True


@shared_task(name='update_notification', ignore_result=True)
def update_notification():
    channel_layer = get_channel_layer()
    status_data = update_status()

    cached_data = _redis.get("graph_data")
    graph_data = {}
    if cached_data:
        graph_data = json.loads(cached_data)

    async_to_sync(channel_layer.group_send)(
        'notifications',
        {
            'type': 'notify_event',
            'data': json.dumps({
                'event':'update-graph',
                'data': graph_data
            }, default=str),
        }
    )

    async_to_sync(channel_layer.group_send)(
        'notifications',
        {
            'type': 'notify_event',
            'data': json.dumps({
                'event':'update-status',
                'data': status_data
            }, default=str),
        }
    )

    return True


@shared_task(name='update_lelantus', ignore_result=True)
def update_lelantus():
    status_data = requests.get(BEAM_NODE_API + '/status')
    st_data_json = status_data.json()
    
    privacy_model = Max_privacy_withdraw()
    privacy_model.from_json({'value': st_data_json['shielded_possible_ready_in_hours'], 'per_day': st_data_json['shielded_outputs_per_24h']})
    privacy_model.save()

    swaps_data = requests.get(BEAM_NODE_API + '/swap_totals')
    swaps_stats = swaps_data.json()
    swaps_model = Swap_stats()
    swaps_model.from_json({
        'btc': swaps_stats['bitcoin_offered'],
        'dash': swaps_stats['dash_offered'],
        'doge': swaps_stats['dogecoin_offered'],
        'ltc': swaps_stats['litecoin_offered'],
        'qtum': swaps_stats['qtum_offered'],
        'wbtc': swaps_stats['wbtc_offered'],
        'eth': swaps_stats['ethereum_offered'],
        'usdt': swaps_stats['usdt_offered'],
        'dai': swaps_stats['dai_offered']
    })
    swaps_model.save()

    return True

@shared_task(name='update_swap_offers_daily_cumulative', ignore_result=True)
def update_swap_offers_daily_cumulative():
    r = requests.get(BEAM_NODE_API + '/swap_offers')
    offers = r.json()

    for _offer in offers:
        try:
            obj = Swaps_daily_stats.objects.get(tx_id=_offer['txId'])
        except Swaps_daily_stats.DoesNotExist:
            obj = Swaps_daily_stats()
            obj.from_json({
                'swap_amount': _offer['swap_amount'], 
                'swap_currency': _offer['swap_currency'], 
                'tx_id': _offer['txId']})
            obj.save()

    return True


@shared_task(name='update_swap_offers_daily_clear', ignore_result=True)
def update_swap_offers_daily_clear():
    offers = Swaps_daily_stats.objects.all()
    if offers:
        offers.delete()

    date_now = timezone.now()
    dates_before = date_now - timedelta(days=int(5))
    data_to_remove = Max_privacy_withdraw.filter(created_at__lt=dates_before)
    if data_to_remove:
        data_to_remove.delete()
    
    data_to_remove = Swap_stats.filter(created_at__lt=dates_before)
    if data_to_remove:
        data_to_remove.delete()

    return True

