from celery.task.schedules import crontab
from celery.decorators import periodic_task
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from .serializers import *
import requests
import json
import pytz
import redis
import os

from .models import *
from datetime import datetime
HEIGHT_STEP = 43800
BEAM_NODE_API = 'http://localhost:8888'
BLOCKS_PER_DAY = 1440
BLOCKS_STEP = 100
MONTHS_IN_YEAR = 12
FIRST_YEAR_VALUE = 20
REST_YEARS_VALUE = 10

TELEGRAM_URL = "https://api.telegram.org/bot"

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

@periodic_task(run_every=(crontab(minute='*/1')), name="bot_check", ignore_result=True)
def bot_check():
    # delay check
    users = Bot_users.objects.all()
    last_block = Block.objects.all().order_by('height')[Block.objects.count()-1]
    prelast_block = Block.objects.all().order_by('height')[Block.objects.count()-2]

    millisec_last = last_block.timestamp.timestamp() * 1000
    millisec_prelast = prelast_block.timestamp.timestamp() * 1000

    millisec_dif = millisec_last - millisec_prelast
    if millisec_dif >= 180000:
        seconds=(millisec_dif/1000)%60
        seconds = int(seconds)
        minutes=(millisec_dif/(1000*60))%60
        minutes = int(minutes)
        print(millisec_dif / 1000)

        for user in users:
            send_message(bytes.decode(b'\xE2\x9D\x97', 'utf8')+
                'Block delay alert! Between '+
                str(last_block.height)+
                ' and '+
                str(prelast_block.height)+
                ' heights is: '+str(minutes)+' min '+str(seconds)+' sec ', user.external_id)
    # rollback check
    rollback_heights = Forks_event_detection.objects.all().order_by('height')
    if rollback_heights.count() > 0:
        r_tmp_height = rollback_heights[0]
        counter = 0
        r_first_height = 0
        for num, r_height in enumerate(rollback_heights):
            if num != 0:
                print(num, '---', r_height.height, r_tmp_height.height)
                height_dif = r_height.height - r_tmp_height.height
                if height_dif == 1:
                    if counter == 0:
                        print('counter is 0, first height reset')
                        r_first_height = r_tmp_height.height

                    counter += 1
                    print('counter is: ', counter)
                
                if height_dif > 1 or num == (rollback_heights.count() - 1):
                    if counter >= 5:
                        print('rollback detected!')
                        for user in users:
                            try:
                                last_block = Rollback_reports.objects.get(height_from=r_first_height, height_to=r_height.height)
                                print('rollback exist!')
                            except ObjectDoesNotExist:
                                print('rollback saved!')
                                reports = Rollback_reports()
                                reports.from_json({'from': r_first_height, 'to': r_height.height})
                                reports.save()
                                send_message(bytes.decode(b'\xE2\x9D\x97', 'utf8')+
                                    'Rollback alert! Detected between '+
                                    str(r_first_height)+
                                    ' - '+
                                    str(r_height.height)+
                                    ' heights. Rollback depth='+
                                    str(r_height.height-r_first_height), user.external_id)
                    counter = 0
                r_tmp_height = r_height
 
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
