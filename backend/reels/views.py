from django.shortcuts import render
from .models import ReelModel
from .reelSerializer import ReelSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAllReels(req):
    reels = ReelModel.objects.all()
    serialize_reels =ReelSerializer(reels , many=True)
    return Response({"reels":serialize_reels.data} , status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def createReel(req):
    serializer = ReelSerializer(data=req.data)
    if serializer.is_valid():
        serializer.save(user=req.user)
        return Response(
            {"message": "Reel created successfully"},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
