from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Card(models.Model):
    name = models.CharField(max_length=30)
    image = models.FilePathField()
    quantity = models.IntegerField()
    card_type = models.CharField(max_length=10)
    contract = models.CharField(max_length=10, null=True)

class Room(models.Model):
    name = models.CharField(max_length=255)
    users = models.ManyToManyField(User)