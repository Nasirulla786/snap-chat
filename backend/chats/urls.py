from django.urls import path
from . import views
urlpatterns = [
    path("get-friends/" ,views.getMyFriends.as_view() , name="get-friends"),
    path("add-friend/<int:id>" , views.AddFriend.as_view() , name="add-friend"),
    path("my-friend/<int:id>" , views.ChatFriend.as_view() , name="my-friend"),
    path("send-message/<int:id>" , views.SendMessage.as_view() , name="send-message"),
    path("get-pending-request/", views.GetPendingRequests.as_view() , name="get-pending-request" ),
    path("accept-invite/<int:id>/" , views.AcceptInvite.as_view(), name="accept-invite"),
    path("send-snap/<int:id>/" , views.SendSnap.as_view() , name="send-snap"),

]
