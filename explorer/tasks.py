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





    