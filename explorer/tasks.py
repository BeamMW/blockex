from celery import shared_task
from celery.schedules import crontab
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db.models import Sum, Avg
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from .serializers import *
import requests
import json
import pytz
import redis
import os
import time
import io

from .models import *
from datetime import datetime, timedelta

HEIGHT_STEP = 43800
BEAM_NODE_API = 'http://localhost:8888'
BLOCKS_PER_DAY = 1440
BLOCKS_STEP = 100
MONTHS_IN_YEAR = 12
FIRST_YEAR_VALUE = 20
REST_YEARS_VALUE = 10

TELEGRAM_URL = "https://api.telegram.org/bot"
_redis = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

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

    swap_request = requests.get(BEAM_NODE_API + '/swap_totals')
    swap_totals = swap_request.json()
    data['swap_totals'] = swap_totals

    _redis.set('status', json.dumps(data, default=str))
    return data


@shared_task(name="bot_check", ignore_result=True)
def bot_check():
    r = requests.get(BEAM_NODE_API + '/status')
    current_height = r.json()['height']
    last_block = r.json()

    users = Bot_users.objects.all()

    millisec_last = last_block['timestamp'] * 1000
    date_now = int(round(time.time() * 1000))

    millisec_dif = date_now - millisec_last
    if millisec_dif >= 600000:
        seconds=(millisec_dif/1000)%60
        seconds = int(seconds)
        minutes=(millisec_dif/(1000*60))%60
        minutes = int(minutes)

        if _redis.get('delay_alert') != 'sended':
            for user in users:
                send_message(bytes.decode(b'\xE2\x9D\x97', 'utf8')+
                    'Block delay alert! '+str(minutes)+' min '+str(seconds)+
                    ' sec. Last block height: '+str(current_height), user.external_id)
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

    while (last_height < current_height + BLOCKS_STEP):
        height_dif = current_height - last_height
        
        blocks_to_check = False
        n = BLOCKS_STEP
        from_height = last_height
        if height_dif < BLOCKS_STEP and current_height > BLOCKS_PER_DAY:
            n = BLOCKS_PER_DAY
            from_height = last_height - BLOCKS_PER_DAY
            blocks_to_check = Block.objects.filter(height__gte=str(from_height), height__lt=str(last_height))

        r = requests.get(BEAM_NODE_API + '/blocks?height=' + str(from_height) + '&n=' + str(n))
        
        blocks = r.json()
        _inputs = []
        _outputs = []
        _kernels = []
        new_values = False
        fork_detected = False
        
        for _block in blocks:

            if 'found' in _block and _block['found'] is False:
                continue

            if not fork_detected and not new_values and blocks_to_check:
                try:
                    check_value = blocks_to_check.get(height=_block['height'])
                    if check_value.hash != _block['hash']:
                        # Fork detected
                        fork_detected = True
                        fd = Forks_event_detection()
                        fd.from_json(_block['height'])
                        fd.save()

                        Input.objects.filter(block_id=check_value.id).delete()
                        Output.objects.filter(block_id=check_value.id).delete()
                        Kernel.objects.filter(block_id=check_value.id).delete()

                        check_value.delete()

                except ObjectDoesNotExist:
                    new_values = True

            if fork_detected and not new_values and blocks_to_check:
                try:
                    check_value = blocks_to_check.get(height=_block['height'])

                    Input.objects.filter(block_id=check_value.id).delete()
                    Output.objects.filter(block_id=check_value.id).delete()
                    Kernel.objects.filter(block_id=check_value.id).delete()

                    check_value.delete()
                except ObjectDoesNotExist:
                    new_values = True

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
    return True


@shared_task(name="update_charts", ignore_result=True)
def update_charts():
    latest_block = Block.objects.latest('height')
    latest_block_height = int(latest_block.height)
    from_height = int(latest_block_height) - 4 * 1440
    to_height = int(latest_block_height) + 1

    blocks = Block.objects.filter(height__gte=from_height, height__lt=to_height).order_by('height')

    timestamp_now = round(time.time())
    date_now = datetime.fromtimestamp(timestamp_now)
    date_from = datetime.fromtimestamp(timestamp_now - 345600)

    lelantus_data = Max_privacy_withdraw.objects.filter(created_at__gte=date_from, created_at__lt=date_now)

    counter = 0
    lelantus_res = []
    lelantus_sum = 0
    for data in lelantus_data:
        if (counter == 12):
            lelantus_avg = lelantus_sum / 12
            lelantus_res.insert(0, [lelantus_avg, data.created_at])
            lelantus_sum = 0
            counter = 0

        lelantus_sum += float(data.value)
        counter += 1

    hour_offset = timedelta(hours=int(2))
    start_date = blocks.first().timestamp
    end_date = blocks.last().timestamp

    date_with_offset = end_date - hour_offset

    result = {
        'items': [],
        'avg_blocks': 0
    }

    while end_date > start_date:
        offset_blocks = blocks.filter(timestamp__gte=date_with_offset, timestamp__lt=end_date)
        blocks_count = offset_blocks.count() / 2

        fee = 0
        diff = 0
        hashrate = 0
        date = date_with_offset
        if blocks_count is not 0:
            diff = offset_blocks.aggregate(Avg('difficulty'))['difficulty__avg']
            hashrate = diff / 60
            fee = offset_blocks.aggregate(Sum('fee'))['fee__sum']
            date = offset_blocks.last().timestamp
        
        result['items'].insert(0, {
            'fee': fee,
            'difficulty': diff,
            'hashrate': hashrate,
            'date': date,
            'blocks_count': blocks_count
        })

        end_date = date_with_offset
        date_with_offset -= hour_offset

    result['avg_blocks'] = (blocks.count() / len(result['items'])) / 2
    result['items'].pop(0)

    result['lelantus'] = lelantus_res

    _redis.set('graph_data', json.dumps(result, default=str))
    return True


@shared_task(name='update_notification', ignore_result=True)
def update_notification():
    channel_layer = get_channel_layer()
    status_data = update_status()

    graph_data = json.loads(_redis.get("graph_data"))

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
    lelantus_data = status_data.json()['shielded_possible_ready_in_hours']
    
    privacy_model = Max_privacy_withdraw()
    privacy_model.from_json({'value': lelantus_data})
    privacy_model.save()

    swaps_data = requests.get(BEAM_NODE_API + '/swap_totals')
    swaps_stats = swaps_data.json()
    swaps_model = Swap_stats()
    swaps_model.from_json({
        'btc': swaps_stats['bitcoin_offered'],
        'dash': swaps_stats['dash_offered'],
        'doge': swaps_stats['dogecoin_offered'],
        'ltc': swaps_stats['litecoin_offered'],
        'qtum': swaps_stats['qtum_offered']
    })
    swaps_model.save()

    return True