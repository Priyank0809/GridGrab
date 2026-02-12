import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GridConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "grid_updates"
        self.room_group_name = f"room_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def block_captured(self, event):
        await self.send(text_data=json.dumps(event))