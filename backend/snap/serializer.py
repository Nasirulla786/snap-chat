from rest_framework import serializers
from .models import ModelSnap


class SnapSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelSnap

        fields = ["id","image"]
