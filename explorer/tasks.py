from celery.task.schedules import crontab
from celery.decorators import periodic_task
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError

import requests
import json

from datetime import datetime
import pytz
import redis

from .models import *

HEIGHT_STEP = 43800
BEAM_NODE_API = 'http://localhost:8888'
BLOCKS_PER_DAY = 1440
BLOCKS_STEP = 100

@periodic_task(run_every=(crontab(minute='*/1')), name="update_blockchain", ignore_result=True)
def update_blockchain():

    # # Find last seen height
    _redis = redis.Redis(host='localhost', port=6379, db=0)
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

        if current_height_step_amount > 12:
            coins_in_circulation_treasury = 12 * 20 * HEIGHT_STEP + \
                                            (current_height_step_amount - 12) * 10 * HEIGHT_STEP
        else:
            coins_in_circulation_treasury = current_height_step_amount * 20 * HEIGHT_STEP
        _redis.set('coins_in_circulation_treasury', coins_in_circulation_treasury)

    # Next treasury emission coin amount

    next_treasury_coin_amount = _redis.get('next_treasury_coin_amount')
    if (not next_treasury_coin_amount) or (current_height_step_amount > last_height_step_amount):

        if current_height_step_amount > 12:
            next_treasury_coin_amount = 10 * HEIGHT_STEP
        else:
            next_treasury_coin_amount = 20 * HEIGHT_STEP
        _redis.set('next_treasury_coin_amount', next_treasury_coin_amount)

    # Retrieve missing blocks in 100 block pages

    while (last_height < current_height + BLOCKS_STEP):
        height_dif = current_height - last_height
        
        blocks_to_check = False
        n = BLOCKS_STEP
        from_height = last_height
        if height_dif < BLOCKS_STEP:
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
    _redis.delete('block_data')
    _redis.delete('coins_in_circulation_mined')
    _redis.delete('total_coins_in_circulation')
    _redis.delete('latest_block')
    _redis.delete('latest_block_height')


@periodic_task(run_every=(crontab(hour="*/1")), name="update_charts", ignore_result=True)
def update_charts():
    _redis = redis.Redis(host='localhost', port=6379, db=0)

    _redis.delete("daily_graph_data")
    _redis.delete("weekly_graph_data")
    _redis.delete("monthly_graph_data")
    _redis.delete("yearly_graph_data")
    _redis.delete("all_graph_data")
