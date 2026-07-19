from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view , permission_classes
from .serializer import registerSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

@api_view(['POST'])
def createUser(req):
    try:
        user = registerSerializer(data=req.data)
        if user.is_valid():
            user.save()
            return Response({"Message":"User Create SuccessFully"}, status=status.HTTP_201_CREATED)
        else:
            return Response(
            user.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@api_view(["POST"])
@permission_classes([AllowAny])
def loginUser(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {"message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    response = Response(
        {
            "message": "Login successful"
        },
        status=status.HTTP_200_OK
    )

    response.set_cookie(
        key="access_token",
        value=str(refresh.access_token),
        httponly=True,
        samesite="Lax",
        max_age=15 * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def currentUser(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    })


@api_view(['GET'])
def logoutUser(req):
    response = Response({"message":"Logout successfully"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return response
