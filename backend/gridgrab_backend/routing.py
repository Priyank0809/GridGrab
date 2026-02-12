from django.urls import path
from grid.consumers import GridConsumer

websocket_urlpatterns = [
    path("ws/grid/", GridConsumer.as_asgi()),
]