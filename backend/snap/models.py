from django.db import models
from django.contrib.auth.models import User


class ModelSnap(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
