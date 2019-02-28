from .models import *
from rest_framework import serializers


class InputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Input
        fields = ('commitment', 'maturity')


class OutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Output
        fields = ('commitment', 'maturity', 'coinbase')


class KernelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kernel
        fields = ('fee', 'excess', 'block_id', 'kernel_id', 'minHeight', 'maxHeight')


class BlockSerializer(serializers.ModelSerializer):

    inputs = serializers.SerializerMethodField()
    outputs = serializers.SerializerMethodField()
    kernels = serializers.SerializerMethodField()

    def get_inputs(self, obj):
        qs = obj.inputs.all()
        return InputSerializer(qs, many=True, read_only=True).data

    def get_outputs(self, obj):
        qs = obj.outputs.all()
        return OutputSerializer(qs, many=True, read_only=True).data

    def get_kernels(self, obj):
        qs = obj.kernels.all()
        return KernelSerializer(qs, many=True, read_only=True).data

    class Meta:
        model = Block
        fields = ('height', 'prev', 'hash', 'chainwork',
                  'difficulty', 'subsidy', 'timestamp',
                  'fee', 'inputs', 'outputs', 'kernels')


class BlockHeaderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Block
        fields = ('height','hash', 'chainwork','difficulty','subsidy','timestamp', 'fee')

