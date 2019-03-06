from django.shortcuts import render
from django.db.models import Sum, Count
from django.core.exceptions import ObjectDoesNotExist
import json

# Create your views here.
from .models import *
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import HTTP_200_OK
from .serializers import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from datetime import datetime, timedelta
from django.utils import timezone
import redis
import io
from rest_framework.parsers import JSONParser

_redis = redis.Redis(host='localhost', port=6379, db=0)


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all().order_by('-height')
    serializer_class = BlockSerializer


@api_view(['GET'])
def get_block_range(request):
    range = int(request.GET['range'])
    graph_data = False

    if range == 1:
        graph_data = _redis.get("daily_graph_data")
    if range == 7:
        graph_data = _redis.get("weekly_graph_data")
    if range == 30:
        graph_data = _redis.get("monthly_graph_data")
    if range == 365:
        graph_data = _redis.get("yearly_graph_data")
    if range == 0:
        graph_data = _redis.get("all_graph_data")

    if graph_data:
        stream = io.BytesIO(graph_data)
        data = JSONParser().parse(stream)
        return Response(data, status=HTTP_200_OK)
    else:
        latest_block_height = _redis.get('latest_block_height')
        if not latest_block_height:
            latest_block = Block.objects.latest('height')
            latest_block_height = int(latest_block.height)
            _redis.set('latest_block_height', latest_block_height)

        if range > 0:
            from_height = int(latest_block_height) - range * 1440
        else:
            from_height = 0
        to_height = int(latest_block_height)

        blocks = Block.objects.filter(height__gte=from_height, height__lt=to_height)
        serializer = BlockHeaderSerializer(blocks, many=True)
        if range == 1:
            _redis.set('daily_graph_data', JSONRenderer().render(serializer.data))
        if range == 7:
            _redis.set('weekly_graph_data', JSONRenderer().render(serializer.data))
        if range == 30:
            _redis.set('monthly_graph_data', JSONRenderer().render(serializer.data))
        if range == 365:
            _redis.set('yearly_graph_data', JSONRenderer().render(serializer.data))
        if range == 0:
            _redis.set('all_graph_data', JSONRenderer().render(serializer.data))

        return Response(serializer.data, status=HTTP_200_OK)


@api_view(['GET'])
def get_block(request):
    b = Block.objects.get(hash=request.GET['hash'])
    serializer = BlockSerializer(b)
    return Response(serializer.data, status=HTTP_200_OK)


@api_view(['GET'])
def search(request):
    q = request.GET['q']

    if q:
        try:
            b = Block.objects.get(height=q)
        except (ValueError, ObjectDoesNotExist):
            try:
                kernel_by_id = Kernel.objects.get(kernel_id=q)
                serialized_kernel = KernelSerializer(kernel_by_id)
                if serialized_kernel:
                    b = Block.objects.get(id=serialized_kernel.data['block_id'])
            except ObjectDoesNotExist:
                try:
                    b = Block.objects.get(hash=q)
                except ObjectDoesNotExist:
                    return Response({'found': False}, status=HTTP_200_OK)
        serializer = BlockSerializer(b)
        return Response(serializer.data, status=HTTP_200_OK)

    return Response({'found': False}, status=HTTP_200_OK)


@api_view(['GET'])
def get_status(request):
    b = _redis.get('latest_block')

    if b:
        stream = io.BytesIO(b)
        data = JSONParser().parse(stream)
    else:
        b = Block.objects.latest('height')
        serializer = BlockHeaderSerializer(b)
        _redis.set('latest_block', JSONRenderer().render(serializer.data))
        data = serializer.data

    coins_in_circulation_mined = _redis.get('coins_in_circulation_mined')
    if coins_in_circulation_mined:
        data['coins_in_circulation_mined'] = coins_in_circulation_mined
    else:
        te = Block.objects.all().aggregate(Sum('subsidy'))
        coins_in_circulation_mined = int(te['subsidy__sum']) * 10**-8
        _redis.set('coins_in_circulation_mined', coins_in_circulation_mined)
        data['coins_in_circulation_mined'] = coins_in_circulation_mined

    coins_in_circulation_treasury = _redis.get('coins_in_circulation_treasury')
    if not coins_in_circulation_treasury:
        coins_in_circulation_treasury = 0

    data['coins_in_circulation_treasury'] = coins_in_circulation_treasury
    data['total_coins_in_circulation'] = float(coins_in_circulation_mined) + float(coins_in_circulation_treasury)
    data['next_treasury_emission_block_height'] = _redis.get('next_treasury_emission_height')
    data['next_treasury_emission_coin_amount'] = _redis.get('next_treasury_coin_amount')
    data['total_emission'] = _redis.get('total_coins_emission')

    return Response(data, status=HTTP_200_OK)

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
DAILY_BLOCK_STEP = 1440
BEAM_NODE_API = 'http://localhost:8888'

@api_view(['GET'])
def get_major_block(request):
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


    height_shift = current_height - DAILY_BLOCK_STEP
    r = requests.get(BEAM_NODE_API + '/blocks?height=' +
                     str(height_shift) + '&n=' + str(DAILY_BLOCK_STEP))
    blocks = r.json()
    last_height += 1
    height_shift -= 1
    existing_blocks = Block.objects.filter(height__gte=height_shift, height__lt=last_height)

    is_fork_exist = False
    for idx, _block in enumerate(reversed(blocks)):
        if 'found' in _block and _block['found'] is False:
            continue

        b = Block()
        b.from_json(_block)

        fork_counter = 0
        is_block_not_exist = False

        if not is_fork_exist:
            for idItem, _blockItem in enumerate(reversed(blocks)):
                if idItem > idx and str(_blockItem['height']) == str(b.height):
                    fork_counter += 1
            if fork_counter > 0:
                f = Forks_event_detection()
                f.from_json(b.height)
                f.save()
                is_fork_exist = True

                to_height = last_height + 1
                remaining_blocks = existing_blocks.filter(height__gte=str(b.height), height__lt=str(to_height))
                remaining_blocks.delete()
        else:
            is_block_not_exist = existing_blocks.filter(height=b.height).count() == 0

        if is_fork_exist or is_block_not_exist:
            try:
                b.save()
            except IntegrityError as e:
                b = Block.objects.get(height=b.height)
                continue
            fee = 0.0

            for _input in _block['inputs']:
                i = Input(block=b)
                i.from_json(_input)
                i.save()

            for _output in _block['outputs']:
                o = Output(block=b)
                o.from_json(_output)
                o.save()

            for _kernel in _block['kernels']:
                k = Kernel(block=b)
                k.from_json(_kernel)

                fee = fee + k.fee

                k.save()

            b.fee = fee
            b.save()

    return Response('ok', status=HTTP_200_OK)


@api_view(['GET'])
def get_coins_in_circulation_mined(request):
    coins_in_circulation = _redis.get('coins_in_circulation_mined')
    if not coins_in_circulation:
        te = Block.objects.all().aggregate(Sum('subsidy'))
        coins_in_circulation = int(te['subsidy__sum']) * 10 ** -8
        _redis.set('coins_in_circulation_mined', coins_in_circulation)
    return Response(json.loads(coins_in_circulation), status=HTTP_200_OK)


@api_view(['GET'])
def get_coins_in_circulation_treasury(request):
    coins_in_circulation_treasury = _redis.get('coins_in_circulation_treasury')
    if not coins_in_circulation_treasury:
        return Response({'Something went wrong'}, status=404)
    return Response(json.loads(coins_in_circulation_treasury), status=HTTP_200_OK)


@api_view(['GET'])
def get_total_coins_in_circulation(request):
    total_coins_in_circulation = _redis.get('total_coins_in_circulation')
    if not total_coins_in_circulation:
        coins_in_circulation_mined = _redis.get('coins_in_circulation_mined')
        if not coins_in_circulation_mined:
            te = Block.objects.all().aggregate(Sum('subsidy'))
            coins_in_circulation_mined = int(te['subsidy__sum']) * 10 ** -8
            _redis.set('coins_in_circulation_mined', coins_in_circulation_mined)
            total_coins_in_circulation = coins_in_circulation_mined
        coins_in_circulation_treasury = _redis.get('coins_in_circulation_treasury')
        if coins_in_circulation_treasury:
            total_coins_in_circulation = float(coins_in_circulation_mined) + float(coins_in_circulation_treasury)

    _redis.set('total_coins_in_circulation', total_coins_in_circulation)
    return Response(float(total_coins_in_circulation), status=HTTP_200_OK)


@api_view(['GET'])
def get_next_treasury_emission_block_height(request):
    next_treasury_emission_height = _redis.get('next_treasury_emission_height')
    if not next_treasury_emission_height:
        return Response({'Something went wrong'}, status=404)
    return Response(json.loads(next_treasury_emission_height), status=HTTP_200_OK)


@api_view(['GET'])
def get_next_treasury_emission_coin_amount(request):
    next_treasury_coin_amount = _redis.get('next_treasury_coin_amount')
    if not next_treasury_coin_amount:
        return Response({'Something went wrong'}, status=404)
    return Response(json.loads(next_treasury_coin_amount), status=HTTP_200_OK)


@api_view(['GET'])
def get_total_emission(request):
    total_coins_emission =_redis.get('total_coins_emission')
    if not total_coins_emission:
        return Response({'Something went wrong'}, status=404)
    return Response(json.loads(total_coins_emission), status=HTTP_200_OK)


@api_view(['GET'])
def get_block_by_kernel(request):
    kernel_id = request.GET['kernel_id']

    if kernel_id:
        try:
            kernel_by_id = Kernel.objects.get(kernel_id=kernel_id)
            serialized_kernel = KernelSerializer(kernel_by_id)
            if serialized_kernel:
                block = Block.objects.get(id=serialized_kernel.data['block_id'])
                serializer = BlockSerializer(block)
                return Response({'block': serializer.data['height']}, status=HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({'Incorrect kernel id'}, status=404)
    else:
        return Response({'Incorrect kernel id'}, status=404)