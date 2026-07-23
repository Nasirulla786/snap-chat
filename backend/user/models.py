from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(to=User , on_delete=models.CASCADE , related_name="user_profile")
    image = models.URLField()
    bio = models.CharField(max_length=255)
