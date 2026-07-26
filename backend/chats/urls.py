from django.urls import path
from . import views
urlpatterns = [
    path("get-friends/" ,views.getMyFriends.as_view() , name="get-friends"),
    path("add-friend/<int:id>" , views.AddFriend.as_view() , name="add-friend"),
    path("my-friend/<int:id>" , views.ChatFriend.as_view() , name="my-friend"),
    path("send-message/<int:id>" , views.SendMessage.as_view() , name="send-message")
]
