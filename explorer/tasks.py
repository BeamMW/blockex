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

@periodic_task(run_every=(crontab(minute='*/1')), name="update_blockchain", ignore_result=True)
def update_blockchain():

    
    # # Find last seen height
    _redis = redis.Redis(host='localhost', port=6379, db=0)
    last_height = _redis.get('beam_blockex_last_height')


    if not last_height:
        try:
            last_block = Block.objects.latest('height')
            last_height = last_block.height if last_block else 1
        except ObjectDoesNotExist as e:
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

    while (last_height < current_height + 100) :
        r = requests.get(BEAM_NODE_API + '/blocks?height=' + str(last_height) + '&n=100')
        blocks = r.json()

        for _block in blocks:

            if 'found' in _block and _block['found'] == False:
                continue

            b = Block()
            b.from_json(_block)


            fee = 0.0

            try:
                b.save()
            except IntegrityError as e:
                b = Block.objects.get(height = b.height)
                continue

            for _input in _block['inputs']:
                i = Input(block = b)
                i.from_json(_input)
                i.save()

            for _output in _block['outputs']:
                o = Output()
                o.from_json(_output)
                o.block = b
                o.save()

            for _kernel in _block['kernels']:
                k = Kernel()
                k.from_json(_kernel)

                fee = fee + k.fee

                k.block = b
                k.save()

            b.fee = fee
            b.save()

        last_height += 100


    _redis.set('beam_blockex_last_height', current_height)
    _redis.delete('graph_data')
    _redis.delete('block_data')
    _redis.delete('coins_in_circulation_mined')
    _redis.delete('total_coins_in_circulation')
    _redis.delete('latest_block')
    _redis.delete('latest_block_height')





    