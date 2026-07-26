from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FriendRequest , Message

class UserSerializer(serializers.ModelSerializer):
    image = serializers.CharField(source="user_profile.image", read_only=True)
    class Meta:
        model = User
        fields = ["id" ,"username" , "image"]


class FriendSerializer(serializers.ModelSerializer):

    class Meta:
        model = FriendRequest
        fields =  [ "from_user","to_user","status"]


class MessagesSerializer(serializers.ModelSerializer):
    # image = serializers.CharField()
    class Meta:
        model = Message
        fields = "__all__"
