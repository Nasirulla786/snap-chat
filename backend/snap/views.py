from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import SnapSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
import cloudinary.uploader
from rest_framework import status
from .models import  ModelSnap


@permission_classes([IsAuthenticated])
class CreateSnap(APIView):
    def post(self, request):

        image = request.data.get("snap")

        if not image:
            return Response({"message": "Snap not found"})

        upload = cloudinary.uploader.upload(image, resource_type="image")

        data = {"image": upload["secure_url"]}

        serializeSnap = SnapSerializer(data=data)

        print(serializeSnap)
        if serializeSnap.is_valid():
            serializeSnap.save(user=request.user)
            return Response(
                {"snap": serializeSnap.data}, status=status.HTTP_201_CREATED
            )

        else:
            print("yaha are")
            return Response(
                {"message": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST
            )



@permission_classes([IsAuthenticated])
class GetMySnaps(APIView):
    def get(self, request):
        snaps = ModelSnap.objects.filter(user=request.user)

        serializer = SnapSerializer(snaps, many=True)
        # print(serializer.data)

        return Response(serializer.data, status=status.HTTP_200_OK)
