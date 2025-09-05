from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Team(models.Model):
    """Team model for hackathon teams"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_teams')
    members = models.ManyToManyField(User, through='TeamMembership', related_name='teams')
    max_size = models.PositiveIntegerField(default=4)
    required_skills = models.JSONField(default=list)  # Skills needed for the team
    event_tags = models.JSONField(default=list)  # Event/hackathon tags
    is_open = models.BooleanField(default=True)  # Whether accepting new members
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    @property
    def current_size(self):
        return self.members.count()
    
    @property
    def is_full(self):
        return self.current_size >= self.max_size


class TeamMembership(models.Model):
    """Through model for team membership with additional data"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, blank=True)  # e.g., "Frontend Dev", "Designer"
    joined_at = models.DateTimeField(auto_now_add=True)
    is_leader = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'team']
    
    def __str__(self):
        return f"{self.user.username} in {self.team.name}"


class TeamInvitation(models.Model):
    """Model for team invitations"""
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    DECLINED = 'declined'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (DECLINED, 'Declined'),
    ]
    
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['team', 'invitee']
    
    def __str__(self):
        return f"Invitation to {self.invitee.username} for {self.team.name}"