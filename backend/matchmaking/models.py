from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class MatchingSession(models.Model):
    """Track matching sessions for analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    query_skills = models.JSONField(default=list)
    query_interests = models.JSONField(default=list)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Match session for {self.user.username} at {self.created_at}"


class ProjectSuggestion(models.Model):
    """AI-generated project suggestions based on user skills"""
    title = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=list)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
        default='intermediate'
    )
    estimated_duration = models.CharField(max_length=50, blank=True)  # e.g., "2-3 days"
    tech_stack = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title