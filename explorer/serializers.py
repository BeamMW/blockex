from .models import *
from rest_framework import serializers


class InputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Input
        fields = ('commitment', 'height', 'extra')


class OutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Output
        fields = ('commitment', 'extra')


class KernelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kernel
        fields = ('block_id', 'fee', 'kernel_id', 'extra', 'minHeight', 'maxHeight')


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
        fields = ('height', 'hash', 'chainwork', 'difficulty', 'subsidy', 'timestamp', 'fee')


class ForkDetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forks_event_detection
        fields = "__all__"

class BotUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bot_users
        fields = "__all__"

