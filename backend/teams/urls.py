from django.urls import path
from .views import (
    TeamListCreateView, TeamDetailView, UserTeamsView, 
    TeamInvitationsView, send_team_invitation, respond_to_invitation
)

urlpatterns = [
    path('', TeamListCreateView.as_view(), name='team-list-create'),
    path('<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('my-teams/', UserTeamsView.as_view(), name='user-teams'),
    path('invitations/', TeamInvitationsView.as_view(), name='team-invitations'),
    path('<int:team_id>/invite/', send_team_invitation, name='send-invitation'),
    path('invitations/<int:invitation_id>/respond/', respond_to_invitation, name='respond-invitation'),
]