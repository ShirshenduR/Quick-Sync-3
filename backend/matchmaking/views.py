from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .services import MatchingService
from .models import MatchingSession, ProjectSuggestion
from .serializers import (
    MatchResultSerializer, AvailabilityOverlapSerializer,
    MatchingQuerySerializer, ProjectSuggestionSerializer
)

User = get_user_model()


class FindMatchesView(generics.GenericAPIView):
    """Find matching users based on skills and interests"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MatchingQuerySerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            matching_service = MatchingService()
            
            # Get matches for current user
            matches = matching_service.find_matches(
                user=request.user,
                limit=serializer.validated_data['limit']
            )
            
            # Log matching session
            MatchingSession.objects.create(
                user=request.user,
                query_skills=serializer.validated_data.get('skills', []),
                query_interests=serializer.validated_data.get('interests', []),
                results_count=len(matches)
            )
            
            # Serialize results
            result_serializer = MatchResultSerializer(matches, many=True)
            return Response(result_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_availability_overlap(request, user_id):
    """Get availability overlap with another user"""
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    matching_service = MatchingService()
    overlap_data = matching_service.get_availability_overlap(
        request.user, 
        other_user
    )
    
    serializer = AvailabilityOverlapSerializer(overlap_data)
    return Response(serializer.data)


class ProjectSuggestionsView(generics.ListAPIView):
    """Get project suggestions based on user skills"""
    serializer_class = ProjectSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        user_skills = set(user.skills) if user.skills else set()
        
        if not user_skills:
            # Return general suggestions if user has no skills
            return ProjectSuggestion.objects.all()[:10]
        
        # Find projects that match user skills
        matching_projects = []
        for project in ProjectSuggestion.objects.all():
            project_skills = set(project.required_skills)
            skill_overlap = len(user_skills.intersection(project_skills))
            
            if skill_overlap > 0:
                matching_projects.append((project, skill_overlap))
        
        # Sort by skill overlap
        matching_projects.sort(key=lambda x: x[1], reverse=True)
        return [project for project, _ in matching_projects[:10]]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_user_embedding(request):
    """Refresh user's AI embedding"""
    matching_service = MatchingService()
    embedding_data = matching_service.create_user_embedding(request.user)
    
    return Response({
        'message': 'User embedding refreshed successfully',
        'embedding_created': True
    })


# Mock data for project suggestions - in reality this would come from AI or database
SAMPLE_PROJECTS = [
    {
        'title': 'Smart Home Dashboard',
        'description': 'Build a web dashboard to control IoT devices with real-time data visualization.',
        'required_skills': ['React', 'Node.js', 'IoT', 'WebSocket'],
        'difficulty_level': 'intermediate',
        'estimated_duration': '3-4 days',
        'tech_stack': ['React', 'Express.js', 'Socket.io', 'MongoDB']
    },
    {
        'title': 'AI-Powered Recipe Finder',
        'description': 'Create an app that suggests recipes based on available ingredients using ML.',
        'required_skills': ['Python', 'Machine Learning', 'Flask', 'API Development'],
        'difficulty_level': 'advanced',
        'estimated_duration': '4-5 days',
        'tech_stack': ['Python', 'Flask', 'TensorFlow', 'SQLite']
    },
    {
        'title': 'Collaborative Code Editor',
        'description': 'Build a real-time collaborative code editor with syntax highlighting.',
        'required_skills': ['JavaScript', 'WebSocket', 'CodeMirror', 'Backend'],
        'difficulty_level': 'advanced',
        'estimated_duration': '4-6 days',
        'tech_stack': ['Vue.js', 'Socket.io', 'CodeMirror', 'Redis']
    },
    {
        'title': 'Personal Finance Tracker',
        'description': 'Create a mobile app to track expenses and visualize spending patterns.',
        'required_skills': ['React Native', 'Mobile Development', 'Charts', 'Database'],
        'difficulty_level': 'intermediate',
        'estimated_duration': '3-4 days',
        'tech_stack': ['React Native', 'Expo', 'Chart.js', 'Firebase']
    },
    {
        'title': 'Social Media Analytics Tool',
        'description': 'Build a tool to analyze social media engagement and generate insights.',
        'required_skills': ['Data Analysis', 'API Integration', 'Visualization', 'Python'],
        'difficulty_level': 'intermediate',
        'estimated_duration': '2-3 days',
        'tech_stack': ['Python', 'Pandas', 'Matplotlib', 'Twitter API']
    }
]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def populate_sample_projects(request):
    """Populate database with sample project suggestions (dev only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff users can populate sample data'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    created_count = 0
    for project_data in SAMPLE_PROJECTS:
        project, created = ProjectSuggestion.objects.get_or_create(
            title=project_data['title'],
            defaults=project_data
        )
        if created:
            created_count += 1
    
    return Response({
        'message': f'{created_count} sample projects created',
        'total_projects': ProjectSuggestion.objects.count()
    })