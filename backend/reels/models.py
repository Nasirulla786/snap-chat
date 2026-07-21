from django.db import models
from django.contrib.auth.models import User

class ReelModel(models.Model):
    caption=models.TextField(blank=True)
    reel = models.URLField()
    user = models.ForeignKey(to=User , on_delete=models.CASCADE , related_name='user_reel')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(to=User , blank=True )
