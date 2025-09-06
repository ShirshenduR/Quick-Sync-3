from rest_framework import serializers
from .models import Team, TeamMembership, TeamInvitation
from accounts.serializers import UserMatchSerializer


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserMatchSerializer(read_only=True)
    
    class Meta:
        model = TeamMembership
        fields = ['user', 'role', 'joined_at', 'is_leader']



class TeamSerializer(serializers.ModelSerializer):
    memberships = TeamMembershipSerializer(
        source='teammembership_set', 
        many=True, 
        read_only=True
    )
    current_size = serializers.IntegerField(read_only=True, default=0)
    max_size = serializers.IntegerField(read_only=True, default=0)
    is_full = serializers.ReadOnlyField()

    creator = serializers.SerializerMethodField()

    def get_creator(self, obj):
        if obj.creator:
            from accounts.serializers import UserMatchSerializer
            return UserMatchSerializer(obj.creator).data
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Safely convert integer fields to int, fallback to instance value or 0 if blank or invalid
        for field in ['max_size', 'current_size']:
            value = data.get(field)
            if value in [None, '', [], {}]:
                # fallback to instance attribute if possible
                attr = getattr(instance, field, None)
                try:
                    data[field] = int(attr) if attr is not None else 0
                except (ValueError, TypeError):
                    data[field] = 0
            else:
                try:
                    data[field] = int(value)
                except (ValueError, TypeError):
                    data[field] = 0
        return data

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

    def validate(self, data):
        # Ensure required fields are present
        if not data.get('name'):
            raise serializers.ValidationError({'name': 'Team name is required.'})
        if not data.get('max_size'):
            data['max_size'] = 4
        return data


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