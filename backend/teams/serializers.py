from rest_framework import serializers
from .models import Team, TeamMembership, TeamInvitation
from accounts.serializers import UserMatchSerializer


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserMatchSerializer(read_only=True)
    
    class Meta:
        model = TeamMembership
        fields = ['user', 'role', 'joined_at', 'is_leader']


class TeamSerializer(serializers.ModelSerializer):
    creator = UserMatchSerializer(read_only=True)
    memberships = TeamMembershipSerializer(
        source='teammembership_set', 
        many=True, 
        read_only=True
    )
    current_size = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'creator', 'memberships',
            'max_size', 'current_size', 'is_full', 'required_skills',
            'event_tags', 'is_open', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'name', 'description', 'max_size', 'required_skills',
            'event_tags', 'is_open'
        ]


class TeamInvitationSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    inviter = UserMatchSerializer(read_only=True)
    invitee = UserMatchSerializer(read_only=True)
    
    class Meta:
        model = TeamInvitation
        fields = [
            'id', 'team', 'inviter', 'invitee', 'message',
            'status', 'created_at', 'responded_at'
        ]
        read_only_fields = ['id', 'created_at', 'responded_at']


class SendInvitationSerializer(serializers.Serializer):
    """Serializer for sending team invitations"""
    invitee_id = serializers.IntegerField()
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)