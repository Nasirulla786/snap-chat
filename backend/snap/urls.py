from django.urls import path
from . import views

urlpatterns = [
    path("create-snap/" , views.CreateSnap.as_view() , name="create-snap"),
      path("my-snaps/", views.GetMySnaps.as_view() ),

]
