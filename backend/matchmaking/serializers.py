from rest_framework import serializers
from .models import MatchingSession, ProjectSuggestion
from accounts.serializers import UserMatchSerializer


class MatchResultSerializer(serializers.Serializer):
    """Serializer for match results"""
    user = UserMatchSerializer(read_only=True)
    score = serializers.FloatField(read_only=True)
    skills_similarity = serializers.FloatField(read_only=True)
    interests_similarity = serializers.FloatField(read_only=True)
    combined_similarity = serializers.FloatField(read_only=True)


class AvailabilityOverlapSerializer(serializers.Serializer):
    """Serializer for availability overlap data"""
    overlap_percentage = serializers.FloatField(read_only=True)
    common_times = serializers.ListField(child=serializers.CharField(), read_only=True)


class MatchingQuerySerializer(serializers.Serializer):
    """Serializer for matching query parameters"""
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )
    interests = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )
    limit = serializers.IntegerField(default=20, min_value=1, max_value=50)


class ProjectSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSuggestion
        fields = [
            'id', 'title', 'description', 'required_skills',
            'difficulty_level', 'estimated_duration', 'tech_stack',
            'created_at'
        ]