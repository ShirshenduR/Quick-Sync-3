from django.urls import path
from .views import ProfileView, UserListView, sync_firebase_user

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('sync-firebase/', sync_firebase_user, name='sync-firebase'),
]