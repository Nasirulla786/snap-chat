import json

from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Message


class ChatConsumer(WebsocketConsumer):

    def connect(self):

        self.user = self.get_user_from_cookie()

        if self.user is None:
            self.close()
            return

        self.user_group = f"user_{self.user.id}"

        async_to_sync(
            self.channel_layer.group_add
        )(
            self.user_group,
            self.channel_name
        )

        print("WebSocket connected:", self.user.username)

        self.accept()


    def get_user_from_cookie(self):

        headers = self.scope.get("headers", [])

        access_token = None

        for key, value in headers:

            if key == b"cookie":

                cookie_string = value.decode()

                for cookie in cookie_string.split(";"):

                    name, separator, cookie_value = cookie.strip().partition("=")

                    if name == "access_token":

                        access_token = cookie_value


        if not access_token:
            return None


        try:

            jwt_auth = JWTAuthentication()

            validated_token = jwt_auth.get_validated_token(
                access_token
            )

            return jwt_auth.get_user(validated_token)

        except Exception as error:

            print("WebSocket authentication error:", error)

            return None


    def receive(self, text_data):

        data = json.loads(text_data)

        message = data.get("message")
        receiver_id = data.get("receiver_id")

        receiver = User.objects.get(id=receiver_id)

        saved_message = Message.objects.create(
            sender=self.user,
            receiver=receiver,
            text_message=message
        )

        print("Message saved:", saved_message.id)


        async_to_sync(
            self.channel_layer.group_send
        )(
            f"user_{receiver.id}",
            {
                "type": "send_message",
                "message": message,
                "sender": self.user.id,
            }
        )

        async_to_sync(
            self.channel_layer.group_send
        )(
            f"user_{self.user.id}",
            {
                "type": "send_message",
                "message": message,
                "sender": self.user.id,
            }
        )


    def send_message(self, event):

        print("Sending message to:", self.user.username)

        self.send(
            text_data=json.dumps({
                "message": event["message"],
                "sender": event["sender"],
            })
        )


    def disconnect(self, close_code):

        if hasattr(self, "user_group"):

            async_to_sync(
                self.channel_layer.group_discard
            )(
                self.user_group,
                self.channel_name
            )



        print("WebSocket disconnected")
