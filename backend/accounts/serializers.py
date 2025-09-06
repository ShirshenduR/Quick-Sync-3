from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'bio', 'skills', 'interests', 'availability', 'event_tags', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'bio', 
                 'skills', 'interests', 'availability', 'event_tags']


class UserMatchSerializer(serializers.ModelSerializer):
    """Serializer for matching purposes with minimal data"""
    firebase_uid = serializers.CharField(allow_blank=True, allow_null=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 
                 'bio', 'skills', 'interests', 'event_tags', 'firebase_uid']