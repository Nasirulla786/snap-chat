from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from .serializer import UserSerializer, FriendSerializer , MessagesSerializer
from rest_framework.response import Response
from .models import FriendRequest, Message
from django.db.models import Q
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
import cloudinary.uploader
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


def broadcast_chat_message(sender_id, receiver_id, message_text, image_url=None):
    channel_layer = get_channel_layer()

    if channel_layer is None:
        return

    payload = {
        "type": "send_message",
        "message": message_text or "",
        "sender": sender_id,
    }

    if image_url:
        payload["image"] = image_url

    for user_id in [receiver_id, sender_id]:
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            payload,
        )

@permission_classes([IsAuthenticated])
class AddFriend(APIView):
    def get(self, request, id):

        if id == request.user.id:
            return Response({"message": "U cant add yourself"})
        to_user = get_object_or_404(User, pk=id)
        friend = FriendRequest.objects.filter(
            Q(from_user=request.user.id, to_user=to_user.id)
            | Q(from_user=to_user.id, to_user=request.user.id)
        ).exists()

        if friend:
            return Response({"message": "U already sent request.."})

        FriendRequest.objects.create(from_user=request.user, to_user=to_user)

        return Response({"message": "Request Sent", "status": "pending"})


class getMyFriends(APIView):
    def get(self, req):

        my_friends = FriendRequest.objects.filter(
            status=FriendRequest.StatusChoices.ACCEPTED
        ).filter(Q(from_user=req.user) | Q(to_user=req.user))

        friends = []

        for friend in my_friends:

            if req.user == friend.from_user:
                friends.append(friend.to_user)
            else:
                friends.append(friend.from_user)

        serializer = UserSerializer(friends, many=True)

        return Response({"data": serializer.data})


class ChatFriend(APIView):
    def get(self, req, id):
        friend = get_object_or_404(User, pk=id)

        if not friend:
            return Response({"message": "friend does not exist"})

        serializeData = UserSerializer(friend)

        messages = Message.objects.filter(
            Q(sender=friend, receiver=req.user)
            | Q(sender=req.user, receiver=friend)
        )


        serializeMessage = MessagesSerializer(messages , many=True)


        return Response({"friend": serializeData.data ,"messages":serializeMessage.data})




class SendMessage(APIView):
    def post(self, req, id):
        text = req.data.get("message")
        image = req.FILES.get("image")

        friend = get_object_or_404(User, pk=id)
        sender = req.user


        image_url = None

        if image:
            upload = cloudinary.uploader.upload(
                image,
                resource_type="image"
            )

            image_url = upload["secure_url"]

        if text or image:
            message = Message.objects.create(
                sender=sender,
                receiver=friend,
                text_message=text,
                image=image_url
            )

            broadcast_chat_message(
                sender.id,
                friend.id,
                text,
                image_url,
            )

            serializeMessage = MessagesSerializer(message)

            return Response({
                "message": "Message sent",
                "data": serializeMessage.data,
            })

        return Response({"message": "Nothing to send"})


@method_decorator(csrf_exempt, name="dispatch")
class SendSnap(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, req, id):
        snap = req.FILES.get("image")
        friend = get_object_or_404(User, pk=id)
        sender = req.user
        image_url = None
        if snap:
            upload = cloudinary.uploader.upload(snap, resource_type="image")
            image_url = upload["secure_url"]
        if image_url:
            message = Message.objects.create(
                sender=sender,
                receiver=friend,
                text_message=None,
                image=image_url
            )

            broadcast_chat_message(
                sender.id,
                friend.id,
                "",
                image_url
            )

        return Response({
            "message": "Snap sent",
            "data": image_url
        })








class GetPendingRequests(APIView):
    def get(self , req):
        friendRequests = FriendRequest.objects.filter(status=FriendRequest.StatusChoices.PENDING).filter(to_user=req.user)

        serializeData = FriendSerializer(friendRequests ,many=True)

        return Response({"data":serializeData.data})



class AcceptInvite(APIView):
    def get(self , req , id):
        # print("thi sis id",id)
        pendingFriend = get_object_or_404(User , pk=id)
        if not pendingFriend:
            return Response({"message":"Friend not found"})

        serializeFriend = UserSerializer(pendingFriend)


        friendRequest = FriendRequest.objects.filter(
                from_user=pendingFriend,
                to_user=req.user,
                status=FriendRequest.StatusChoices.PENDING
            ).first()

        if friendRequest:
            friendRequest.status = FriendRequest.StatusChoices.ACCEPTED
            friendRequest.to_user  = req.user
            friendRequest.save()
            return Response({"message":"Accept Invite successfully" , "friend":serializeFriend.data})
        else:
            return Response({"message":"Not accepted"})
