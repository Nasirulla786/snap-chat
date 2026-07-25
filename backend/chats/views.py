from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from .serializer import UserSerializer , FriendSerializer
from rest_framework.response import Response
from .models import FriendRequest
from django.db.models import Q
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated



@permission_classes([IsAuthenticated])
class AddFriend(APIView):
    def get(self , request , id):

        if id == request.user.id:
            return Response({"message":"U cant add yourself"})
        to_user = get_object_or_404(User , pk=id)
        friend = FriendRequest.objects.filter(
            Q(from_user=request.user.id, to_user=to_user.id) |
            Q(from_user=to_user.id, to_user=request.user.id)
        ).exists()

        if friend:
            return Response({"message":"U already sent request.."})

        FriendRequest.objects.create(
            from_user = request.user,to_user=to_user
        )

        return Response({"message":"Request Sent" , "status":"pending"})
    

class getMyFriends(APIView):
    def get(self, req):

        my_friends = FriendRequest.objects.filter(
            status=FriendRequest.StatusChoices.ACCEPTED
        ).filter(
            Q(from_user=req.user) | Q(to_user=req.user)
        )


        friends = []

        for friend in my_friends:

            if req.user == friend.from_user:
                friends.append(friend.to_user)
            else:
                friends.append(friend.from_user)


        serializer = UserSerializer(
            friends,
            many=True
        )


        return Response({
            "data": serializer.data
        })
