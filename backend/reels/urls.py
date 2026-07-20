from django.urls import path
from . import views
urlpatterns = [
    path("get-all-reels/" , views.getAllReels , name="get-all-reels"),
    path("create-reel", views.createReel ,name="create-reel")
]
