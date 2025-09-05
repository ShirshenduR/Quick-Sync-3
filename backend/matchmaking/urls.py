from django.urls import path
from .views import (
    FindMatchesView, get_availability_overlap, ProjectSuggestionsView,
    refresh_user_embedding, populate_sample_projects
)

urlpatterns = [
    path('find/', FindMatchesView.as_view(), name='find-matches'),
    path('availability/<int:user_id>/', get_availability_overlap, name='availability-overlap'),
    path('projects/', ProjectSuggestionsView.as_view(), name='project-suggestions'),
    path('refresh-embedding/', refresh_user_embedding, name='refresh-embedding'),
    path('populate-projects/', populate_sample_projects, name='populate-projects'),
]