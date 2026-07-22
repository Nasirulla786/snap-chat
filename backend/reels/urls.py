from django.urls import path
from . import views

urlpatterns = [
    path("get-all-reels/", views.getAllReels, name="get-all-reels"),
    path("create-reel", views.createReel, name="create-reel"),
    path("like-reel/<int:id>", views.likeReel, name="like-reel"),
    path("comment-reel/<int:id>", views.CommentReel, name="comment-reel"),
    path("get-comments/<int:id>", views.getReelComments, name="get-reel-comments"),
    path("get-all-comments", views.getALlComments, name="get-all-comments"),
]
