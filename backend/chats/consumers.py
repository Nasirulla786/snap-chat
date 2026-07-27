import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Message


class ChatConsumer(WebsocketConsumer):

    # =========================================
    # CONNECT
    # =========================================

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


        self.accept()


        print(
            "WebSocket connected:",
            self.user.username
        )


    # =========================================
    # RECEIVE CHAT MESSAGE
    # =========================================

    def receive(self, text_data):

        data = json.loads(text_data)


        message_type = data.get("type")


        # =====================================
        # 📞 INCOMING CALL NOTIFICATION
        # =====================================

        if message_type == "call-incoming":

            receiver_id = data.get(
                "receiver_id"
            )


            async_to_sync(
                self.channel_layer.group_send
            )(
                f"user_{receiver_id}",

                {
                    "type": "incoming_call",

                    "caller_id":
                        self.user.id,

                    "caller_username":
                        self.user.username,

                    "call_type":
                        data.get(
                            "call_type",
                            "video"
                        ),
                }
            )


            print(
                "CALL NOTIFICATION SENT TO:",
                receiver_id
            )


            return


        # =====================================
        # 💬 NORMAL CHAT MESSAGE
        # =====================================

        message = data.get(
            "message"
        )


        receiver_id = data.get(
            "receiver_id"
        )


        if not message or not receiver_id:

            return


        receiver = User.objects.get(
            id=receiver_id
        )


        saved_message = Message.objects.create(

            sender=self.user,

            receiver=receiver,

            text_message=message

        )


        print(
            "Message saved:",
            saved_message.id
        )


        # Send message to receiver

        async_to_sync(
            self.channel_layer.group_send
        )(

            f"user_{receiver.id}",

            {

                "type":
                    "send_message",

                "message":
                    message,

                "sender":
                    self.user.id,

            }

        )


        # Send message to sender also

        async_to_sync(
            self.channel_layer.group_send
        )(

            f"user_{self.user.id}",

            {

                "type":
                    "send_message",

                "message":
                    message,

                "sender":
                    self.user.id,

            }

        )


    # =========================================
    # SEND CHAT MESSAGE
    # =========================================

    def send_message(self, event):

        print(
            "Sending message to:",
            self.user.username
        )

        payload = {
            "type": "message",
            "message": event.get("message", ""),
            "sender": event["sender"],
        }

        if event.get("image"):
            payload["image"] = event["image"]

        self.send(
            text_data=json.dumps(payload)
        )


    # =========================================
    # INCOMING CALL EVENT
    # =========================================

    def incoming_call(self, event):


        print(
        "🔥 INCOMING CALL HANDLER RUNNING FOR:",
        self.user.username
    )

        print(

            "Incoming call from:",

            event["caller_username"]

        )


        self.send(

            text_data=json.dumps(

                {

                    "type":
                        "incoming-call",

                    "caller_id":
                        event["caller_id"],

                    "caller_username":
                        event["caller_username"],

                    "call_type":
                        event["call_type"],

                }

            )

        )


    # =========================================
    # DISCONNECT
    # =========================================

    def disconnect(self, close_code):

        if hasattr(
            self,
            "user_group"
        ):

            async_to_sync(

                self.channel_layer.group_discard

            )(

                self.user_group,

                self.channel_name

            )


        print(
            "WebSocket disconnected"
        )


    # =========================================
    # AUTHENTICATION
    # =========================================

    def get_user_from_cookie(self):

        headers = self.scope.get(
            "headers",
            []
        )


        access_token = None


        for key, value in headers:

            if key == b"cookie":

                cookie_string = value.decode()


                for cookie in cookie_string.split(";"):

                    name, separator, cookie_value = (

                        cookie.strip().partition("=")

                    )


                    if name == "access_token":

                        access_token = cookie_value


        if not access_token:

            return None


        try:

            jwt_auth = JWTAuthentication()


            validated_token = (

                jwt_auth.get_validated_token(

                    access_token

                )

            )


            return jwt_auth.get_user(

                validated_token

            )


        except Exception as error:

            print(

                "WebSocket authentication error:",

                error

            )


            return None


# =================================================
# 📞 CALL CONSUMER
# =================================================


class CallConsumer(WebsocketConsumer):


    # =========================================
    # CONNECT
    # =========================================

    def connect(self):

        self.user = self.get_user_from_cookie()


        if self.user is None:

            self.close()

            return


        friend_id = int(

            self.scope[
                "url_route"
            ][
                "kwargs"
            ][
                "friend_id"
            ]

        )


        self.call_group = (

            f"call_"

            f"{min(self.user.id, friend_id)}_"

            f"{max(self.user.id, friend_id)}"

        )


        async_to_sync(

            self.channel_layer.group_add

        )(

            self.call_group,

            self.channel_name

        )


        self.accept()


        print(

            self.user.username,

            "joined call"

        )


        # Inform both users that someone joined

        async_to_sync(

            self.channel_layer.group_send

        )(

            self.call_group,

            {

                "type":
                    "peer_joined",

                "user_id":
                    self.user.id,

            }

        )


    # =========================================
    # RECEIVE WEBRTC SIGNALING
    # =========================================

    def receive(self, text_data):

        data = json.loads(
            text_data
        )


        message_type = data.get(
            "type"
        )


        # =====================================
        # 📞 CALL SIGNALING
        # =====================================

        allowed_types = [

            "offer",

            "answer",

            "ice-candidate",

        ]


        if message_type in allowed_types:


            async_to_sync(

                self.channel_layer.group_send

            )(

                self.call_group,

                {

                    "type":
                        "call_message",

                    "sender":
                        self.user.id,

                    "data":
                        data,

                }

            )


            print(

                "CALL SIGNAL SENT:",

                message_type

            )


            return


    # =========================================
    # PEER JOINED
    # =========================================

    def peer_joined(self, event):

        self.send(

            text_data=json.dumps(

                {

                    "type":
                        "peer-joined",

                    "user_id":
                        event["user_id"],

                }

            )

        )


    # =========================================
    # FORWARD WEBRTC SIGNAL
    # =========================================

    def call_message(self, event):


        # Don't send signal back to sender

        if (

            event["sender"]

            ==

            self.user.id

        ):

            return


        self.send(

            text_data=json.dumps(

                event["data"]

            )

        )


    # =========================================
    # DISCONNECT
    # =========================================

    def disconnect(self, close_code):

        if hasattr(

            self,

            "call_group"

        ):

            async_to_sync(

                self.channel_layer.group_discard

            )(

                self.call_group,

                self.channel_name

            )


        print(

            self.user.username,

            "left call"

        )


    # =========================================
    # AUTHENTICATION
    # =========================================

    def get_user_from_cookie(self):

        headers = self.scope.get(

            "headers",

            []

        )


        access_token = None


        for key, value in headers:


            if key == b"cookie":


                cookie_string = value.decode()


                for cookie in cookie_string.split(";"):


                    name, separator, cookie_value = (

                        cookie.strip().partition("=")

                    )


                    if name == "access_token":


                        access_token = cookie_value


        if not access_token:

            return None


        try:


            jwt_auth = JWTAuthentication()


            validated_token = (

                jwt_auth.get_validated_token(

                    access_token

                )

            )


            return jwt_auth.get_user(

                validated_token

            )


        except Exception as error:


            print(

                "WebSocket authentication error:",

                error

            )


            return None
