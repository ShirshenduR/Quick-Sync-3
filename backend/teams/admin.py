from django.contrib import admin
from .models import Team, TeamMembership, TeamInvitation


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'creator', 'current_size', 'max_size', 'is_open', 'created_at']
    list_filter = ['is_open', 'created_at']
    search_fields = ['name', 'creator__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'team', 'role', 'is_leader', 'joined_at']
    list_filter = ['is_leader', 'joined_at']
    search_fields = ['user__username', 'team__name']


@admin.register(TeamInvitation)
class TeamInvitationAdmin(admin.ModelAdmin):
    list_display = ['team', 'inviter', 'invitee', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['team__name', 'inviter__username', 'invitee__username']