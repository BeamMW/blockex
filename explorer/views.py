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
    graph_data = _redis.get("graph_data")
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

        from_height = int(latest_block_height) - 4320
        to_height = int(latest_block_height)

        blocks = Block.objects.filter(height__gte=from_height, height__lt=to_height)
        serializer = BlockHeaderSerializer(blocks, many=True)
        _redis.set('graph_data', JSONRenderer().render(serializer.data))

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

    total_emission = _redis.get('total_emission')
    if total_emission:
        data['total_emission'] = total_emission
    else:
        te = Block.objects.all().aggregate(Sum('subsidy'))
        total_emission = int(te['subsidy__sum']) * 10**-8
        _redis.set('total_emission', total_emission)
        data['total_emission'] = total_emission

    return Response(data, status=HTTP_200_OK)


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
def get_total_coins(request):
    total_emission = _redis.get('total_emission')
    if not total_emission:
        te = Block.objects.all().aggregate(Sum('subsidy'))
        total_emission = int(te['subsidy__sum']) * 10 ** -8
        _redis.set('total_emission', total_emission)
    return Response(total_emission, status=HTTP_200_OK)
