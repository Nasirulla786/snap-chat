from django.db import models
from django.contrib.auth.models import User

class ReelModel(models.Model):
    caption=models.TextField(blank=True)
    reel = models.URLField()
    user = models.ForeignKey(to=User , on_delete=models.CASCADE , related_name='user_reel')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(to=User , blank=True )
   

class Comment(models.Model):
    user = models.ForeignKey(to=User , on_delete=models.CASCADE )
    message = models.CharField(max_length=255)
    reel  = models.ForeignKey(to=ReelModel , on_delete=models.DO_NOTHING ,related_name="reel_comment")

    createdAt = models.DateTimeField(auto_now_add=True)
