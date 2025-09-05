from django.contrib import admin
from .models import MatchingSession, ProjectSuggestion


@admin.register(MatchingSession)
class MatchingSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'results_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']


@admin.register(ProjectSuggestion)
class ProjectSuggestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty_level', 'estimated_duration', 'created_at']
    list_filter = ['difficulty_level', 'created_at']
    search_fields = ['title', 'description']