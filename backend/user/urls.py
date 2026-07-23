from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path("register/", views.createUser , name="register"),
    path("login/", views.loginUser, name="login"),
    path("current-user/" , views.currentUser ,name="current-user"),
    path("logout/", views.logoutUser, name="logout"),
    path("create-profile/" , views.profileCreate , name='create-profile')
]
