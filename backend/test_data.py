#!/usr/bin/env python
"""
Test data generation script for QuickSync
Creates sample users, teams, and project suggestions for development
"""
import os
import sys
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quicksync.settings')
django.setup()

from django.contrib.auth import get_user_model
from teams.models import Team, TeamMembership, TeamInvitation
from matchmaking.models import ProjectSuggestion
from matchmaking.services import MatchingService

User = get_user_model()

SKILLS = [
    'Python', 'Django', 'React', 'Node.js', 'Machine Learning', 'Data Science',
    'UI/UX Design', 'DevOps', 'AWS', 'Docker', 'Kubernetes', 'TensorFlow', 'PyTorch',
    'JavaScript', 'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Linux'
]

INTERESTS = [
    'Web Development', 'AI/ML', 'Data Science', 'Cloud Computing', 'Open Source',
    'UI/UX Design', 'DevOps', 'Mobile Apps', 'Game Development', 'Social Impact'
]

EVENT_TAGS = [
    'Hackathon', 'AI Challenge', 'Open Source', 'Startup Weekend', 'Data Science', 'Design Challenge'
]

FIRST_NAMES = [
    'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan',
    'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Rowan', 'Sky',
    'Luna', 'Nova', 'Zara', 'Kai', 'Nico', 'Robin', 'Ava', 'Liam',
    'Emma', 'Noah', 'Olivia', 'William', 'Sophia', 'James', 'Isabella',
    'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Mia'
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
    'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
    'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
    'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
]

TEAM_NAMES = [
    'Code Crusaders', 'Digital Dreamers', 'Tech Titans', 'Pixel Pirates',
    'Data Dynamos', 'Algorithm Architects', 'Binary Builders', 'Cloud Craftsmen',
    'Innovation Icons', 'Future Founders', 'Smart Solutions', 'Elite Engineers',
    'Creative Coders', 'Agile Avengers', 'Quantum Queriers', 'Neural Networks',
    'DevOps Dragons', 'API Aces', 'Full Stack Force', 'Mobile Mavericks',
    'UI/UX United', 'Game Changers', 'Blockchain Builders', 'AI Achievers'
]

PROJECT_DESCRIPTIONS = [
    'A revolutionary platform that transforms how people collaborate and innovate.',
    'An intelligent system that learns from user behavior to provide personalized experiences.',
    'A cutting-edge application that solves real-world problems using modern technology.',
    'An innovative solution that bridges the gap between users and complex data.',
    'A next-generation platform that empowers users to achieve their goals efficiently.',
    'A smart application that automates repetitive tasks and increases productivity.',
    'An interactive system that makes complex processes simple and intuitive.',
    'A powerful tool that helps users make informed decisions based on data insights.'
]


def generate_availability():
    """Generate random weekly availability"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    time_slots = ['Morning', 'Afternoon', 'Evening', 'Night']
    
    availability = {}
    for day in days:
        # Each person is available 2-4 time slots per day
        num_slots = random.randint(1, 4)
        available_slots = random.sample(time_slots, num_slots)
        availability[day] = available_slots
    
    return availability


def generate_bio():
    """Generate a random bio"""
    templates = [
        "Passionate {role} with {years} years of experience in {domain}. Love building {projects} and contributing to {community}.",
        "Full-stack developer specializing in {tech}. Interested in {interests} and always excited to learn new technologies.",
        "Creative {role} focused on {domain}. Experience with {tech} and passionate about {cause}.",
        "{role} with a background in {domain}. Enjoys {hobby} and building solutions that make a difference.",
        "Enthusiastic developer who loves {tech}. Looking to collaborate on {projects} and {events}."
    ]
    
    roles = ['developer', 'engineer', 'designer', 'product manager', 'data scientist']
    domains = ['web development', 'mobile apps', 'machine learning', 'game development', 'blockchain']
    projects = ['innovative apps', 'open source projects', 'social impact solutions', 'creative tools']
    communities = ['open source', 'tech meetups', 'hackathons', 'developer communities']
    interests = ['AI', 'sustainability', 'education', 'healthcare', 'fintech']
    causes = ['social impact', 'environmental sustainability', 'education', 'accessibility']
    hobbies = ['hiking', 'photography', 'music', 'gaming', 'reading']
    events = ['hackathons', 'code challenges', 'startup competitions']
    
    template = random.choice(templates)
    return template.format(
        role=random.choice(roles),
        years=random.randint(1, 8),
        domain=random.choice(domains),
        projects=random.choice(projects),
        community=random.choice(communities),
        tech=', '.join(random.sample(SKILLS, random.randint(2, 4))),
        interests=random.choice(interests),
        cause=random.choice(causes),
        hobby=random.choice(hobbies),
        events=random.choice(events)
    )



def create_test_users():
    """Create new test users with full profile details and skills"""
    print("Creating new test users with full profile details...")
    users_data = [
        {
            'username': 'alice',
            'email': 'alice@example.com',
            'first_name': 'Alice',
            'last_name': 'Smith',
            'bio': 'Full-stack developer with 5 years experience in Python, Django, and React. Passionate about building scalable web apps and mentoring new developers.',
            'skills': ['Python', 'Django', 'React', 'Docker', 'AWS'],
            'interests': ['Web Development', 'Cloud Computing', 'Open Source'],
            'availability': generate_availability(),
            'event_tags': ['Hackathon', 'Open Source']
        },
        {
            'username': 'bob',
            'email': 'bob@example.com',
            'first_name': 'Bob',
            'last_name': 'Johnson',
            'bio': 'Machine learning engineer with a strong background in data science and AI. Loves working on innovative projects and collaborating with diverse teams.',
            'skills': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL'],
            'interests': ['AI/ML', 'Data Science', 'Social Impact'],
            'availability': generate_availability(),
            'event_tags': ['AI Challenge', 'Data Science']
        },
        {
            'username': 'carol',
            'email': 'carol@example.com',
            'first_name': 'Carol',
            'last_name': 'Williams',
            'bio': 'UI/UX designer focused on creating intuitive user experiences. Skilled in Figma, Adobe XD, and frontend development.',
            'skills': ['UI/UX Design', 'React', 'Figma', 'Adobe XD', 'JavaScript'],
            'interests': ['UI/UX Design', 'Web Development', 'Mobile Apps'],
            'availability': generate_availability(),
            'event_tags': ['Design Challenge', 'Hackathon']
        },
        {
            'username': 'dave',
            'email': 'dave@example.com',
            'first_name': 'Dave',
            'last_name': 'Brown',
            'bio': 'DevOps engineer with expertise in cloud infrastructure, CI/CD, and automation. Enjoys optimizing workflows and deploying scalable systems.',
            'skills': ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Linux'],
            'interests': ['DevOps', 'Cloud Computing', 'Open Source'],
            'availability': generate_availability(),
            'event_tags': ['Startup Weekend', 'Hackathon']
        },
        {
            'username': 'eve',
            'email': 'eve@example.com',
            'first_name': 'Eve',
            'last_name': 'Davis',
            'bio': 'Frontend developer and JavaScript enthusiast. Loves building beautiful interfaces and experimenting with new frameworks.',
            'skills': ['JavaScript', 'React', 'TypeScript', 'CSS', 'Git'],
            'interests': ['Web Development', 'UI/UX Design', 'Game Development'],
            'availability': generate_availability(),
            'event_tags': ['Hackathon', 'Design Challenge']
        }
    ]
    created_users = []
    for user_data in users_data:
        if User.objects.filter(username=user_data['username']).exists():
            print(f"User {user_data['username']} already exists, skipping...")
            continue
        user = User.objects.create_user(**user_data)
        created_users.append(user)
        print(f"Created user: {user.username} ({user.first_name} {user.last_name})")
    return created_users


def create_test_teams(users, count=4):
    """Create test teams and assign members"""
    print(f"\nCreating {count} test teams...")
    # Delete all existing teams and memberships to avoid id conflicts
    TeamMembership.objects.all().delete()
    Team.objects.all().delete()
    created_teams = []
    for i in range(count):
        creator = random.choice(users)
        team_name = random.choice(TEAM_NAMES)
        counter = 1
        original_name = team_name
        while Team.objects.filter(name=team_name).exists():
            team_name = f"{original_name} {counter}"
            counter += 1
        # Ensure all teams are open and have full skills/tags for popup
        team_skills = random.sample(SKILLS, 6)
        team_tags = random.sample(EVENT_TAGS, 3)
        team = Team(
            name=team_name,
            description=random.choice(PROJECT_DESCRIPTIONS),
            creator=creator,
            max_size=random.randint(4, 8),
            required_skills=team_skills,
            event_tags=team_tags,
            is_open=True
        )
        team.save(force_insert=True)
        TeamMembership.objects.create(
            user=creator,
            team=team,
            role='Team Leader',
            is_leader=True
        )
        available_users = [u for u in users if u != creator]
        num_additional_members = random.randint(2, min(team.max_size - 1, 5))
        for member in random.sample(available_users, num_additional_members):
            if not TeamMembership.objects.filter(user=member, team=team).exists():
                roles = ['Developer', 'Designer', 'Product Manager', 'Data Scientist', 'DevOps Engineer']
                TeamMembership.objects.create(
                    user=member,
                    team=team,
                    role=random.choice(roles),
                    is_leader=False
                )
        created_teams.append(team)
        print(f"Created team: {team.name} (Creator: {creator.username}, Members: {team.current_size}, Skills: {team.required_skills}, Tags: {team.event_tags})")
    return created_teams


def create_project_suggestions():
    """Create sample project suggestions"""
    print("\nCreating project suggestions...")
    
    projects = [
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
        },
        {
            'title': 'Virtual Reality Meditation App',
            'description': 'Create an immersive VR experience for guided meditation and relaxation.',
            'required_skills': ['Unity', 'C#', 'VR Development', '3D Modeling'],
            'difficulty_level': 'advanced',
            'estimated_duration': '5-7 days',
            'tech_stack': ['Unity', 'Oculus SDK', 'Blender', 'C#']
        },
        {
            'title': 'Blockchain Voting System',
            'description': 'Develop a secure, transparent voting system using blockchain technology.',
            'required_skills': ['Blockchain', 'Smart Contracts', 'Web3', 'Security'],
            'difficulty_level': 'advanced',
            'estimated_duration': '6-8 days',
            'tech_stack': ['Solidity', 'Ethereum', 'Web3.js', 'React']
        },
        {
            'title': 'Language Learning Game',
            'description': 'Build a gamified mobile app to make language learning fun and engaging.',
            'required_skills': ['Game Development', 'Mobile Development', 'UI/UX', 'Database'],
            'difficulty_level': 'intermediate',
            'estimated_duration': '4-5 days',
            'tech_stack': ['Flutter', 'Firebase', 'Unity', 'Figma']
        }
    ]
    
    created_count = 0
    for project_data in projects:
        project, created = ProjectSuggestion.objects.get_or_create(
            title=project_data['title'],
            defaults=project_data
        )
        if created:
            created_count += 1
            print(f"Created project: {project.title}")
    
    print(f"Created {created_count} new project suggestions")


def generate_user_embeddings(users):
    """Generate AI embeddings for all users"""
    print("\nGenerating AI embeddings for users...")
    
    matching_service = MatchingService()
    
    for user in users:
        try:
            matching_service.create_user_embedding(user)
            print(f"Generated embedding for {user.username}")
        except Exception as e:
            print(f"Error generating embedding for {user.username}: {e}")


def create_sample_invitations(teams, users):
    """Create some sample team invitations"""
    print("\nCreating sample team invitations...")
    
    invitation_messages = [
        "Hey! We'd love to have you join our team for the upcoming hackathon. Your skills would be a great addition!",
        "Hi there! I noticed your profile and think you'd be perfect for our project. Interested in collaborating?",
        "We're looking for talented people to join our team. Would you like to be part of something amazing?",
        "Your experience with {skills} is exactly what we need! Want to build something cool together?",
        "I saw your profile and was impressed by your background. We could really use your expertise on our team!"
    ]
    
    created_count = 0
    for team in teams:
        if team.current_size < team.max_size:
            # Create 1-2 invitations per team
            num_invitations = random.randint(1, 2)
            team_members = [membership.user for membership in team.teammembership_set.all()]
            available_users = [u for u in users if u not in team_members]
            
            if available_users:
                for _ in range(min(num_invitations, len(available_users))):
                    invitee = random.choice(available_users)
                    available_users.remove(invitee)  # Avoid duplicate invitations
                    
                    # Don't create duplicate invitations
                    if not TeamInvitation.objects.filter(team=team, invitee=invitee).exists():
                        invitation = TeamInvitation.objects.create(
                            team=team,
                            inviter=team.creator,
                            invitee=invitee,
                            message=random.choice(invitation_messages).format(
                                skills=', '.join(invitee.skills[:2]) if invitee.skills else 'your skills'
                            ),
                            status=random.choice(['pending', 'pending', 'accepted'])  # 66% pending
                        )
                        
                        # If accepted, add to team
                        if invitation.status == 'accepted':
                            invitation.responded_at = timezone.now()
                            invitation.save()
                            
                            if not TeamMembership.objects.filter(user=invitee, team=team).exists():
                                TeamMembership.objects.create(
                                    user=invitee,
                                    team=team,
                                    role='Team Member'
                                )
                        
                        created_count += 1
                        print(f"Created invitation: {team.name} -> {invitee.username} ({invitation.status})")
    
    print(f"Created {created_count} team invitations")


def main():
    """Main function to generate all test data"""
    print("🚀 QuickSync Test Data Generator")
    print("=" * 40)
    
    try:
        # Create test users
        users = create_test_users()
        if not users:
            print("No new users created, using existing users...")
            users = list(User.objects.all()[:15])

        # Create test teams
        teams = create_test_teams(users, 4)

        # Create project suggestions
        create_project_suggestions()

        # Generate AI embeddings
        generate_user_embeddings(users)

        # Create sample invitations
        create_sample_invitations(teams, users)

        print("\n✅ Test data generation completed successfully!")
        print(f"📊 Summary:")
        print(f"   Users: {User.objects.count()}")
        print(f"   Teams: {Team.objects.count()}")
        print(f"   Projects: {ProjectSuggestion.objects.count()}")
        print(f"   Invitations: {TeamInvitation.objects.count()}")
        print(f"   Memberships: {TeamMembership.objects.count()}")
    except Exception as e:
        print(f"❌ Error generating test data: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()