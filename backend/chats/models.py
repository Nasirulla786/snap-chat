from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    sender  = models.ForeignKey(to=User , on_delete=models.CASCADE  ,related_name='sent_message')
    receiver  = models.ForeignKey(to=User , on_delete=models.CASCADE , related_name='receive_message' )
    text_message = models.CharField(max_length=255 , null= True , blank=True )
    image = models.URLField(null=True , blank=True)


class FriendRequest(models.Model):
    class StatusChoices(models.TextChoices):
        ACCEPTED = "accepted" , "Accepted",
        PENDING = "pending" , "Pending"

    from_user =  models.ForeignKey(to=User , on_delete=models.CASCADE  ,related_name='from_request')
    to_user = models.ForeignKey(to=User,on_delete=models.CASCADE  ,related_name='to_request')
    createdAt = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50 , choices=StatusChoices.choices , default=StatusChoices.PENDING)
