from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserProfileSerializer
import json

User = get_user_model()


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """List all users for matching purposes"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Exclude current user from results
        return User.objects.exclude(id=self.request.user.id)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def sync_firebase_user(request):
    """Sync Firebase user data with Django user"""
    try:
        firebase_uid = request.data.get('firebase_uid')
        user_data = request.data.get('user_data', {})
        
        user = request.user
        user.firebase_uid = firebase_uid
        
        # Update user data from Firebase
        if 'email' in user_data:
            user.email = user_data['email']
        if 'displayName' in user_data:
            # Split display name into first and last name
            name_parts = user_data['displayName'].split(' ', 1)
            user.first_name = name_parts[0]
            if len(name_parts) > 1:
                user.last_name = name_parts[1]
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )