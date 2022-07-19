from pathlib import Path
import os
from django.db import models
from django.contrib.auth.models import User

# ----------------------------------
#   MdGroup table
# ----------------------------------
class MdGroup(models.Model):
    STATUS = (
        (0,"Private"),
        (1,"Public")
    )
    name = models.CharField(max_length=500, unique=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    updated_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(choices=STATUS, default=0)
    order = models.IntegerField(default=0)
    class Meta:
        ordering = ['-order']
    def __str__(self):
        return self.name

# ----------------------------------
#   MdItem table
# ----------------------------------
class MdItem(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=500)
    content = models.TextField()
    updated_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(MdGroup, on_delete=models.CASCADE)
    tags = models.CharField(max_length=500)
    class Meta:
        ordering = ['-created_on']
    def __str__(self):
        return self.name

# ----------------------------------
#   Image table
# ----------------------------------
class MdImage(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='images/')
    updated_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)
    item = models.ForeignKey(MdItem, on_delete=models.CASCADE)
    class Meta:
        ordering = ['-created_on']
    def __str__(self):
        return self.name
    def delete(self, *arg, **kwargs):
        self.image.delete()
        super().delete(*arg, **kwargs)