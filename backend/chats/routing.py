from django.urls import re_path

from .consumers import (
    ChatConsumer,
    CallConsumer
)

print("CALL ROUTE LOADED")

websocket_urlpatterns = [

    re_path(
        r"ws/chat/(?P<chat_id>\d+)/$",
        ChatConsumer.as_asgi()
    ),

    re_path(
        r"ws/call/(?P<friend_id>\d+)/$",
        CallConsumer.as_asgi()
    ),

]
