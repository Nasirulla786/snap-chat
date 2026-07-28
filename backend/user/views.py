from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from .serializer import registerSerializer, ProfileSerializer ,SearchSerialize
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Profile
from chats.models import FriendRequest
import cloudinary.uploader
from django.views.decorators.csrf import csrf_exempt


@api_view(["POST"])
def createUser(req):
    try:
        user = registerSerializer(data=req.data)
        if user.is_valid():
            user.save()
            return Response(
                {"Message": "User Create SuccessFully"}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

from rest_framework_simplejwt.tokens import AccessToken, RefreshToken


@api_view(["POST"])
def loginUser(request):

    login_value = request.data.get("username") or request.data.get("email")
    password = request.data.get("password")

    if not login_value or not password:
        return Response(
            {"message": "Username/email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(Q(username=login_value) | Q(email=login_value)).first()

    if user is None or not user.check_password(password):
        return Response(
            {"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    access = AccessToken.for_user(user)
    refresh = RefreshToken.for_user(user)

    response = Response(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        },
        status=status.HTTP_200_OK,
    )

    response.set_cookie(
        key="access_token",
        value=str(access),
        path="/",
        httponly=True,
        samesite="Lax",
        max_age=15 * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        path="/",
        httponly=True,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60,
    )

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def currentUser(request):
    profile = Profile.objects.filter(user=request.user).first()
    profile_data = ProfileSerializer(profile).data if profile else None

    return Response(
        {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "profile": profile_data,
        }
    )


@api_view(["GET"])
def logoutUser(req):

    response = Response({"message": "Logout successfully"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return response


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def profileCreate(req):
    profile = Profile.objects.filter(user=req.user).first()
    image = req.FILES.get("profile_image")
    if not image:
        return Response({"message": "Image not found"})

    upload = cloudinary.uploader.upload(image, resource_type="image")

    data = {"bio": req.data.get("bio"), "image": upload["secure_url"]}

    if profile:
        return Response(
            {"message": "Your profile already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    else:

        serializer = ProfileSerializer(data=data)

    serializer = ProfileSerializer(data=data)

    if serializer.is_valid():

        serializer.save(user=req.user)
        return Response(
            {"message": "Profile created successfully", "profile": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def search(req):

    query = req.query_params.get("query")

    if not query:
        return Response({
            "message":"Query not found"
        })


    search_data = User.objects.filter(
        username__icontains=query
    )


    users = []


    for user in search_data:

        # check friend request
        is_pending = FriendRequest.objects.filter(
            from_user=req.user,
            to_user=user
        ).exists()


        users.append({

            "id": user.id,

            "username": user.username,

            "image": user.user_profile.image
                if hasattr(user, "user_profile")
                else None,

            "status": "pending" if is_pending else "add"

        })


    return Response({
        "data": users
    })
