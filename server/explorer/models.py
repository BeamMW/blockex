from django.db import models
from postgres_copy import CopyManager

import datetime
import pytz

class Block(models.Model):
    chainwork = models.CharField(blank=True, null=True, max_length=32)
    difficulty = models.FloatField(null=True, blank=True)
    hash = models.CharField(blank=False, null=False, max_length=128, db_index=True)
    height = models.IntegerField(unique=True, primary_key=True)
    prev = models.CharField(blank=False, null=False, max_length=128)
    fee = models.FloatField(null=True, blank=True)
    rate_btc = models.CharField(blank=True, null=True, max_length=32)
    rate_usd = models.CharField(blank=True, null=True, max_length=32)
    subsidy = models.BigIntegerField(null=True, blank=True)
    timestamp = models.DateTimeField()

    objects = CopyManager()

    def from_json(self, _json):
        self.height = _json['height']
        self.hash = _json['hash']
        self.prev = _json['prev']
        self.chainwork = _json['chainwork']
        self.difficulty = _json['difficulty']
        self.subsidy = _json['subsidy']
        self.rate_usd = _json['rate_usd']
        self.rate_btc = _json['rate_btc']
        self.timestamp = datetime.datetime.utcfromtimestamp(_json['timestamp']).replace(tzinfo=pytz.utc)


class Input(models.Model):
    block = models.ForeignKey(Block, related_name='inputs', on_delete=models.CASCADE)
    commitment = models.CharField(null=False, blank=False, max_length=128)
    height = models.IntegerField()

    objects = CopyManager()

    def from_json(self, _json):
        self.commitment = _json['commitment']
        self.height = _json['height']


class Output(models.Model):
    block = models.ForeignKey(Block, related_name='outputs', on_delete=models.CASCADE)
    commitment = models.CharField(null=False, blank=False, max_length=128)
    
    objects = CopyManager()

    def from_json(self, _json):
        self.commitment = _json['commitment']
        

class Kernel(models.Model):
    block = models.ForeignKey(Block, related_name='kernels', on_delete=models.CASCADE)
    fee = models.FloatField()
    kernel_id = models.CharField(null=False, blank=False, max_length=128)
    minHeight = models.IntegerField()
    maxHeight = models.CharField(null=False, blank=False, max_length=128)

    objects = CopyManager()

    def from_json(self, _json):
        self.fee = _json['fee']
        self.kernel_id = _json['id']
        self.minHeight = _json['minHeight']
        self.maxHeight = _json['maxHeight']

class Forks_event_detection(models.Model):
    height = models.IntegerField()

    def from_json(self, height):
        self.height = height

class Bot_users(models.Model):
    external_id = models.PositiveIntegerField(
        unique=True,
    )

class Rollback_reports(models.Model):
    height_from = models.PositiveIntegerField()
    height_to = models.PositiveIntegerField()

    def from_json(self, _json):
        self.height_from = _json['from']
        self.height_to = _json['to']

class Max_privacy_withdraw(models.Model):
    value = models.CharField(null=False, blank=False, max_length=16)
    per_day = models.CharField(null=False, blank=False, max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)

    def from_json(self, _json):
        self.value = _json['value']
        self.per_day = _json['per_day']


class Swap_stats(models.Model):
    btc = models.CharField(null=False, blank=False, max_length=16)
    dash = models.CharField(null=False, blank=False, max_length=16)
    doge = models.CharField(null=False, blank=False, max_length=16)
    ltc = models.CharField(null=False, blank=False, max_length=16)
    qtum = models.CharField(null=False, blank=False, max_length=16)
    wbtc = models.CharField(null=False, blank=False, max_length=16)
    usdt = models.CharField(null=False, blank=False, max_length=16)
    eth = models.CharField(null=False, blank=False, max_length=16)
    dai = models.CharField(null=False, blank=False, max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)

    def from_json(self, _json):
        self.btc = _json['btc']
        self.dash = _json['dash']
        self.doge = _json['doge']
        self.ltc = _json['ltc']
        self.qtum = _json['qtum']
        self.wbtc = _json['wbtc']
        self.usdt = _json['usdt']
        self.eth = _json['eth']
        self.dai = _json['dai']


class Swaps_daily_stats(models.Model):
    swap_amount = models.CharField(null=False, blank=False, max_length=8)
    swap_currency = models.CharField(null=False, blank=False, max_length=8)
    tx_id = models.CharField(null=False, blank=False, unique=True, max_length=40)
    
    def from_json(self, _json):
        self.swap_amount = _json['swap_amount']
        self.swap_currency = _json['swap_currency']
        self.tx_id = _json['tx_id']


class Contract(models.Model):
    cid = models.CharField(blank=True, null=True, max_length=64)
    height = models.IntegerField()
    sid = models.CharField(null=True, blank=True, max_length=64)
    name = models.CharField(null=True, blank=True, max_length=128)
    subtype = models.CharField(null=True, blank=True, max_length=64)

    objects = CopyManager()
    
    def from_json(self, _json):
        self.cid = _json['cid']
        self.height = _json['height']
        self.sid = _json['sid']
        self.name = _json['name']
        self.subtype = _json['subtype']


class Contract_funds(models.Model):
    contract = models.ForeignKey(Contract, related_name='funds', on_delete=models.CASCADE)
    aid = models.IntegerField()
    value = models.CharField(blank=True, null=True, max_length=32)

    objects = CopyManager()

    def from_json(self, _json):
        self.aid = _json['aid']
        self.value = _json['value']
        

class Contract_calls(models.Model):
    contract = models.ForeignKey(Contract, related_name='calls', on_delete=models.CASCADE)
    height = models.IntegerField()
    cname = models.CharField(blank=True, null=True, max_length=32)
    imethod = models.IntegerField(blank=True, null=True)
    methodname = models.CharField(blank=True, null=True, max_length=32)
    faction = models.CharField(blank=True, null=True, max_length=32)
    fval = models.CharField(blank=True, null=True, max_length=32)
    
    objects = CopyManager()

    def from_json(self, _json):
        self.height = _json['height']
        self.cname = _json['cname']
        self.imethod = _json['imethod']
        self.methodname = _json['methodname']
        self.faction = _json['faction']
        self.fval = _json['fval']