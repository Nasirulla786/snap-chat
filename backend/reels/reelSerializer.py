from .models import ReelModel
from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ReelSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)
    likes = LikeSerializer(many=True ,  read_only=True)

    class Meta:
        model = ReelModel
        fields = ["id", "caption", "reel", "user", "createdAt", "updatedAt", "likes"]


