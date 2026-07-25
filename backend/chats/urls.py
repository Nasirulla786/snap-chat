from django.urls import path
from . import views
urlpatterns = [
    path("get-friends/" ,views.getMyFriends.as_view() , name="get-friends"),
    path("add-friend/<int:id>" , views.AddFriend.as_view() , name="add-friend")
]
