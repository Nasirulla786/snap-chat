from django.shortcuts import get_object_or_404
from .models import ReelModel, Comment
from .reelSerializer import ReelSerializer , CommentSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAllReels(req):
    reels = ReelModel.objects.all().order_by('-createdAt')
    serialize_reels = ReelSerializer(reels, many=True)
    return Response({"reels": serialize_reels.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def createReel(req):

    file = req.FILES.get('reel')

    if not file:
        return Response(
            {"error": "Reel file is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        upload = cloudinary.uploader.upload(
            file,
            resource_type="video"
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = {
        "caption": req.data.get("caption"),
        "reel": upload["secure_url"],
    }

    serializer = ReelSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=req.user)
        return Response(
            {"message": "Reel created successfully", "reel": serializer.data},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def likeReel(req, id):
    reel = get_object_or_404(ReelModel, id=id)

    already_liked = reel.likes.filter(id=req.user.id).exists()

    if already_liked:
        reel.likes.remove(req.user)
    else:
        reel.likes.add(req.user)

    reel.refresh_from_db()
    serialize = ReelSerializer(reel)
    return Response({"reel": serialize.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CommentReel(req, id):
    reel = get_object_or_404(ReelModel, id=id)

    message = req.data.get("message")
    if not message:
        return Response(
            {"error": "Comment message is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializeComment = CommentSerializer(data={"message": message})
    if serializeComment.is_valid():
        serializeComment.save(reel=reel, user=req.user)
    else:
        return Response(
            serializeComment.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    myComments = Comment.objects.filter(reel=reel).order_by('createdAt')
    serializeForFrontend = CommentSerializer(myComments, many=True)

    return Response({
        "comments": serializeForFrontend.data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReelComments(req, id):
    reel = get_object_or_404(ReelModel, id=id)
    myComments = Comment.objects.filter(reel=reel).order_by('createdAt')
    serializeForFrontend = CommentSerializer(myComments, many=True)
    return Response({"comments": serializeForFrontend.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getALlComments(req):
    myComments = Comment.objects.all().order_by('-createdAt')
    serializeForFrontend = CommentSerializer(myComments, many=True)
    return Response({"comments": serializeForFrontend.data}, status=status.HTTP_200_OK)


