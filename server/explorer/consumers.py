# chat/consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
# from channels.consumer import SyncConsumer
from asgiref.sync import async_to_sync

from rest_framework.parsers import JSONParser
import io
import redis
_redis = redis.Redis(host='redis', port=6379, db=0)

class ChatConsumer(WebsocketConsumer):

    room_group_name = 'notifications'

    def connect(self):
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
           self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(json.loads(text_data))
        event = text_data_json["event"]
        
        if event == "init-status":
            status_data = json.loads(_redis.get("status"))

            self.send(text_data=json.dumps({
                'event':'init-status',
                'data': status_data
            }))

        if event == "init-graphs":
            graphs_data = json.loads(_redis.get("graph_data"))

            self.send(text_data=json.dumps({
                'event':'init-graphs',
                'data': graphs_data
            }))


        # graph_data = _redis.get("graph_data")
        # graph_stream = io.BytesIO(graph_data)
        # graph_result = JSONParser().parse(graph_stream)
        pass

    def notify_event(self, event):
        data = event['data']

        self.send(text_data=data)