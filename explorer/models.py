from django.db import models
import datetime
import pytz


class Status(models.Model):
    height = models.IntegerField(unique=True, primary_key=True)  
    hash = models.CharField(blank=False, null=False, max_length=128)
    chainwork = models.BinaryField(null=True, blank=True)
    timestamp = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Block(models.Model):
    height = models.IntegerField(unique=True, db_index=True)
    hash = models.CharField(blank=False, null=False, max_length=128, db_index=True)
    chainwork = models.CharField(blank=True, null=True, max_length=128)
    difficulty = models.FloatField(null=True, blank=True)
    subsidy = models.IntegerField(null=True, blank=True)
    fee = models.FloatField(null=True, blank=True)
    prev = models.CharField(blank=False, null=False, max_length=128)

    timestamp = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def from_json(self, _json):
        self.height = _json['height']
        self.hash = _json['hash']
        self.prev = _json['prev']
        self.chainwork = _json['chainwork']
        self.difficulty = _json['difficulty']
        self.subsidy = _json['subsidy']
        self.timestamp = datetime.datetime.utcfromtimestamp(_json['timestamp']).replace(tzinfo=pytz.utc)


class Input(models.Model):
    block = models.ForeignKey(Block, related_name='inputs', on_delete=models.CASCADE)
    commitment = models.CharField(null=False, blank=False, max_length=256)
    maturity = models.IntegerField()

    def from_json(self, _json):
        self.commitment = _json['commitment']
        self.maturity = _json['maturity']


class Output(models.Model):
    block = models.ForeignKey(Block, related_name='outputs', on_delete=models.CASCADE)
    commitment = models.CharField(null=False, blank=False, max_length=256)
    coinbase = models.BooleanField()
    maturity = models.IntegerField()
    incubation = models.IntegerField()

    def from_json(self, _json):
        self.commitment = _json['commitment']
        self.maturity = _json['maturity']
        self.incubation = _json['incubation']
        self.coinbase = 'coinbase' in _json and _json['coinbase']


class Kernel(models.Model):
    block = models.ForeignKey(Block, related_name='kernels', on_delete=models.CASCADE)
    fee = models.FloatField()
    kernel_id = models.CharField(null=False, blank=False, max_length=128)
    excess = models.CharField(null=False, blank=False, max_length=128)
    minHeight = models.IntegerField()
    maxHeight = models.CharField(null=False, blank=False, max_length=128)

    def from_json(self, _json):
        self.excess = _json['excess']
        self.fee = _json['fee']
        self.kernel_id = _json['id']
        self.minHeight = _json['minHeight']
        self.maxHeight = _json['maxHeight']


class Forks_event_detection(models.Model):
    height = models.CharField(blank=False, null=False, max_length=128, db_index=True)

    def from_json(self, _json):
        self.height = _json
