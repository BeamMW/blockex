from django.shortcuts import render
from django.db.models import Count
from django.core.exceptions import ObjectDoesNotExist
import json

# Create your views here.
from .models import *
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import HTTP_200_OK
from .serializers import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from datetime import datetime, timedelta
from django.utils import timezone
from dateutil import parser
from rest_framework.parsers import JSONParser

import requests

import redis
import io
import os

TELEGRAM_URL = "https://api.telegram.org/bot"
BEAM_NODE_API = 'http://localhost:8888'

from django.http import JsonResponse
from django.views import View

_redis = redis.Redis(host='localhost', port=6379, db=0)

class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all().order_by('-height')
    serializer_class = BlockSerializer


@api_view(['GET'])
def get_block_range(request):
    graph_data = _redis.get("graph_data")
    stream = io.BytesIO(graph_data)
    result = JSONParser().parse(stream)
    return Response(result, status=HTTP_200_OK)


@api_view(['GET'])
def get_status(request):
    status_data = _redis.get("status")
    stream = io.BytesIO(status_data)
    result = JSONParser().parse(stream)
    return Response(data, status=HTTP_200_OK)


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
def get_major_block(request):
    access_key = 'E9B60D665A110DD4AAE1D36AF633FF25ED932CFED0413FF005C58A986BA7794A'
    key = request.GET['key']

    if key and key == access_key:
        period = request.GET.get('period')
        blocks = Block.objects.all()
        if period:
            created_at_to = datetime.now(tz=timezone.utc)
            created_at_from = datetime.now(tz=timezone.utc) - timedelta(hours=int(period))
            blocks = blocks.filter(created_at__gte=created_at_from, created_at__lt=created_at_to)

        block = blocks.annotate(summ=Count('outputs', distinct=True) + Count('inputs', distinct=True)
                                     + Count('kernels', distinct=True)).latest('summ')
        serializer = BlockSerializer(block)
        return Response(serializer.data, status=HTTP_200_OK)
    else:
        return Response({'Incorrect access key'}, status=404)


@api_view(['GET'])
def get_coins_in_circulation_mined(request):
    coins_in_circulation = _redis.get('coins_in_circulation_mined')
    if not coins_in_circulation:
        return Response({'Something went wrong'}, status=404)
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
        return Response({'Something went wrong'}, status=404)
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


@api_view(['GET'])
def get_detected_forks(request):
    fd = Forks_event_detection.objects.all()
    serializer = ForkDetectionSerializer(fd, many=True)

    return Response({'fork_heights': serializer.data}, status=HTTP_200_OK)


@api_view(['GET'])
def get_assets_list(request):
    height = request.GET.get('height')
    if height:
        last_height = height
    else:
        last_height = _redis.get('beam_blockex_last_height')

    last_block_req = requests.get(BEAM_NODE_API + '/blocks?height=' + str(int(last_height)) + '&n=1')
    block = last_block_req.json()
    return Response({'assets': block[0]['assets']}, status=HTTP_200_OK)

class BotView(View):
    def post(self, request, *args, **kwargs):
        t_data = json.loads(request.body)
        t_message = t_data["message"]
        t_chat = t_message["chat"]

        try:
            text = t_message["text"].strip().lower()
        except Exception as e:
            return JsonResponse({"ok": "POST request processed"})

        #text = text.lstrip("/")

        Bot_users.objects.get_or_create(external_id=t_chat["id"])

        if text == "/start":
            msg = "Beam Explorer bot was started"
            self.send_message(self.load_token(), msg, t_chat["id"])
        elif text == "/get_rollbacks":
            rollback_heights = Rollback_reports.objects.all()
            self.send_message(self.load_token(), 'Rollback history: ', t_chat["id"])
            for rollback in rollback_heights:
                self.send_message(self.load_token(), str(rollback.height_from)+' - '+str(rollback.height_to)+
                    '. Depth='+str(rollback.height_to - rollback.height_from), t_chat["id"])
        else:
            msg = "Unknown command"

            self.send_message(self.load_token(), msg, t_chat["id"])

        return JsonResponse({"ok": "POST request processed"})
    
    @staticmethod
    def load_token():
        settings_dir = os.path.dirname(__file__)
        proj_root = os.path.abspath(os.path.dirname(settings_dir))
        with open(os.path.join(proj_root)+'/token.json') as token_file:
            data = json.load(token_file)
        return data['token']

    @staticmethod
    def send_message(token, message, chat_id):
        data = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown",
        }
        response = requests.post(
            f"{TELEGRAM_URL}{token}/sendMessage", data=data
        )