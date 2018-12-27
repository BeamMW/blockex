from django.shortcuts import render
from django.db.models import Sum
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


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all().order_by('-height')
    serializer_class = BlockSerializer


@api_view(['GET'])
def get_block_range(request):

    from_height = request.GET['from']
    to_height = request.GET['to']
    from_update = request.GET.get('update')

    blocks = Block.objects.filter(height__gte=from_height, height__lt=to_height)
    if from_update is None:
        serializer = BlockHeaderSerializer(blocks, many=True)
    else:
        serializer = BlockSerializer(blocks, many=True)

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
            kernel_by_id = Kernel.objects.get(kernel_id=q)
            serialized_kernel = KernelSerializer(kernel_by_id)
            if serialized_kernel:
                b = Block.objects.get(id=serialized_kernel.data['block_id'])
        except ObjectDoesNotExist:
            try:
                b = Block.objects.get(hash=q)
            except ObjectDoesNotExist:
                return Response(json.dumps({'found': False}), status=HTTP_200_OK)
        serializer = BlockSerializer(b)
        return Response(serializer.data, status=HTTP_200_OK)

    return Response(json.dumps({'found': False}), status=HTTP_200_OK)


@api_view(['GET'])
def get_status(request):
     b = Block.objects.latest('height')
     serializer = BlockHeaderSerializer(b)

     total_emission = Block.objects.all().aggregate(Sum('subsidy'))

     data = serializer.data
     data['total_emission'] = int(total_emission['subsidy__sum']) * 10**-6

     return Response(data, status=HTTP_200_OK)
