from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserProfileSerializer
import json

User = get_user_model()


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = []
    
    def get_object(self):
        firebase_uid = self.request.data.get('firebase_uid') or self.request.query_params.get('firebase_uid')
        if not firebase_uid:
            raise Exception('Missing firebase_uid in request')
        user = User.objects.filter(firebase_uid=firebase_uid).first()
        if not user:
            raise Exception('User not found for firebase_uid')
        return user


class UserListView(generics.ListAPIView):
    """List all users for matching purposes"""
    serializer_class = UserSerializer
    permission_classes = []
    
    def get_queryset(self):
        # Exclude current user from results
        return User.objects.exclude(id=self.request.user.id)


@api_view(['POST'])
def sync_firebase_user(request):
    """Sync Firebase user data with Django user"""
    try:
        print('sync_firebase_user request.data:', request.data)
        firebase_uid = request.data.get('firebase_uid')
        user_data = request.data.get('user_data', {})

        if not firebase_uid:
            print('Missing firebase_uid in request:', request.data)
            return Response({'error': 'Missing firebase_uid'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(firebase_uid=firebase_uid).first()
        if not user:
            # Generate a unique username
            base_username = f"user_{firebase_uid[:8]}"
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            user = User.objects.create(firebase_uid=firebase_uid, username=username)
        # Update other fields for both new and existing users
        if 'email' in user_data:
            user.email = user_data['email']
        if 'displayName' in user_data:
            name_parts = user_data['displayName'].split(' ', 1)
            user.first_name = name_parts[0]
            if len(name_parts) > 1:
                user.last_name = name_parts[1]
        user.save()

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        print('sync_firebase_user error:', str(e))
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )