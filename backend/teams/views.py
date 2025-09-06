from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Team, TeamMembership, TeamInvitation
from .serializers import (
    TeamSerializer, TeamCreateSerializer, TeamInvitationSerializer,
    SendInvitationSerializer
)

User = get_user_model()


class TeamListCreateView(generics.ListCreateAPIView):
    """List all teams or create a new team"""
    serializer_class = TeamSerializer
    permission_classes = []
    
    def get_queryset(self):
        return Team.objects.filter(is_open=True).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TeamCreateSerializer
        return TeamSerializer
    
    def perform_create(self, serializer):
        firebase_uid = self.request.data.get('firebase_uid')
        print('Creating team for firebase_uid:', firebase_uid)
        user = User.objects.filter(firebase_uid=firebase_uid).first() if firebase_uid else None
        print('Team creator user:', user)
        if not user:
            print('No valid user found for team creation')
            raise serializers.ValidationError({'creator': 'Valid creator (firebase_uid) required.'})
        team = serializer.save(creator=user)
        print('Team created:', team)
        TeamMembership.objects.create(
            user=user,
            team=team,
            role='Team Leader',
            is_leader=True
        )
        print('TeamMembership created for user:', user)


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a team"""
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Team.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TeamCreateSerializer
        return TeamSerializer


class UserTeamsView(generics.ListAPIView):
    """Get teams for current user (public, uses firebase_uid)"""
    serializer_class = TeamSerializer
    permission_classes = []

    def get_queryset(self):
        firebase_uid = self.request.query_params.get('firebase_uid')
        print('Fetching teams for firebase_uid:', firebase_uid)
        if not firebase_uid:
            print('No firebase_uid provided')
            return Team.objects.none()
        user = User.objects.filter(firebase_uid=firebase_uid).first()
        print('User found for teams:', user)
        if not user:
            print('No user found for firebase_uid')
            return Team.objects.none()
        teams = user.teams.all().order_by('-created_at')
        print('Teams found:', list(teams))
        return teams


class TeamInvitationsView(generics.ListAPIView):
    """List team invitations for current user (public, uses firebase_uid)"""
    serializer_class = TeamInvitationSerializer
    permission_classes = []

    def get_queryset(self):
        firebase_uid = self.request.data.get('firebase_uid') or self.request.query_params.get('firebase_uid')
        if not firebase_uid:
            return TeamInvitation.objects.none()
        user = User.objects.filter(firebase_uid=firebase_uid).first()
        if not user:
            return TeamInvitation.objects.none()
        return TeamInvitation.objects.filter(invitee=user).order_by('-created_at')


@api_view(['POST'])
@permission_classes([])
def send_team_invitation(request, team_id):
    """Send a team invitation"""
    print('Send invite request data:', request.data)
    team = get_object_or_404(Team, id=team_id)
    print('Team found for invite:', team)
    firebase_uid = request.data.get('firebase_uid')
    inviter = User.objects.filter(firebase_uid=firebase_uid).first() if firebase_uid else None
    print('Inviter user:', inviter)
    if not inviter:
        print('No valid inviter found')
        return Response({'error': 'Valid inviter (firebase_uid) required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not team.members.filter(id=inviter.id).exists():
        print('Inviter is not a member of the team')
        return Response({'error': 'You must be a team member to send invitations'}, status=status.HTTP_403_FORBIDDEN)
    if team.is_full:
        print('Team is already full')
        return Response({'error': 'Team is already full'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = SendInvitationSerializer(data=request.data)
    if serializer.is_valid():
        invitee_id = serializer.validated_data['invitee_id']
        message = serializer.validated_data.get('message', '')
        print('Invitee id:', invitee_id)
        print('Invite message:', message)
        try:
            invitee = User.objects.get(id=invitee_id)
            print('Invitee user:', invitee)
        except User.DoesNotExist:
            print('Invitee user not found')
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if team.members.filter(id=invitee_id).exists():
            print('Invitee is already a team member')
            return Response({'error': 'User is already a team member'}, status=status.HTTP_400_BAD_REQUEST)
        if TeamInvitation.objects.filter(team=team, invitee=invitee).exists():
            print('Invitation already sent to this user')
            return Response({'error': 'Invitation already sent to this user'}, status=status.HTTP_400_BAD_REQUEST)
        invitation = TeamInvitation.objects.create(
            team=team,
            inviter=inviter,
            invitee=invitee,
            message=message
        )
        print('Invitation created:', invitation)
        serializer = TeamInvitationSerializer(invitation)
        print('Serialized invitation:', serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print('Invite serializer errors:', serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def respond_to_invitation(request, invitation_id):
    """Accept or decline a team invitation"""
    firebase_uid = request.data.get('firebase_uid')
    print('Invitation response: firebase_uid:', firebase_uid)
    user = None
    if firebase_uid:
        user = User.objects.filter(firebase_uid=firebase_uid).first()
        print('Invitation response: user found:', user)
    if not user:
        print('Invitation response: No valid user found for firebase_uid')
        return Response({'error': 'Valid firebase_uid required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        invitation = TeamInvitation.objects.get(id=invitation_id, invitee=user)
        print('Invitation response: invitation found:', invitation)
    except TeamInvitation.DoesNotExist:
        print('Invitation response: No invitation found for user:', user, 'and invitation_id:', invitation_id)
        return Response({'error': 'Invitation not found for this user.'}, status=status.HTTP_403_FORBIDDEN)
    
    if invitation.status != TeamInvitation.PENDING:
        return Response(
            {'error': 'Invitation has already been responded to'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    action = request.data.get('action')  # 'accept' or 'decline'
    
    if action == 'accept':
        # Check if team is still open and not full
        if not invitation.team.is_open or invitation.team.is_full:
            return Response(
                {'error': 'Team is no longer available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user to team
        TeamMembership.objects.create(
            user=user,
            team=invitation.team,
            role=request.data.get('role', '')
        )
        
        invitation.status = TeamInvitation.ACCEPTED
        
    elif action == 'decline':
        invitation.status = TeamInvitation.DECLINED
    else:
        return Response(
            {'error': 'Action must be "accept" or "decline"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    invitation.responded_at = timezone.now()
    invitation.save()
    
    serializer = TeamInvitationSerializer(invitation)
    return Response(serializer.data)