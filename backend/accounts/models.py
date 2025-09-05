from django.db import models
from django.contrib.auth.models import AbstractUser
import json


class User(AbstractUser):
    """Extended user model for QuickSync"""
    bio = models.TextField(max_length=500, blank=True)
    skills = models.JSONField(default=list)  # List of skills
    interests = models.JSONField(default=list)  # List of interests  
    availability = models.JSONField(default=dict)  # Weekly schedule as JSON
    event_tags = models.JSONField(default=list)  # Event preferences
    firebase_uid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username


class UserEmbedding(models.Model):
    """Store precomputed embeddings for users for efficient matching"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    skills_embedding = models.JSONField(default=list)  # Embedding for skills
    interests_embedding = models.JSONField(default=list)  # Embedding for interests
    combined_embedding = models.JSONField(default=list)  # Combined embedding
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Embedding for {self.user.username}"