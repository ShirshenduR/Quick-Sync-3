import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // In a real app, you would get the Firebase token here
    // const user = auth.currentUser;
    // if (user) {
    //   const token = await user.getIdToken();
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  syncFirebaseUser: (firebaseUID, userData) =>
    api.post('/auth/sync-firebase/', { firebase_uid: firebaseUID, user_data: userData }),
  
  getProfile: () => api.get('/auth/profile/'),
  
  updateProfile: (data) => api.patch('/auth/profile/', data),
  
  getUsers: () => api.get('/auth/users/'),
};

// Teams API  
export const teamsAPI = {
  getTeams: () => api.get('/teams/'),
  
  createTeam: (data) => api.post('/teams/', data),
  
  getTeam: (id) => api.get(`/teams/${id}/`),
  
  updateTeam: (id, data) => api.patch(`/teams/${id}/`, data),
  
  deleteTeam: (id) => api.delete(`/teams/${id}/`),
  
  getUserTeams: () => api.get('/teams/my-teams/'),
  
  getInvitations: () => api.get('/teams/invitations/'),
  
  sendInvitation: (teamId, data) => api.post(`/teams/${teamId}/invite/`, data),
  
  respondToInvitation: (invitationId, action, role) => 
    api.post(`/teams/invitations/${invitationId}/respond/`, { action, role }),
};

// Matchmaking API
export const matchmakingAPI = {
  findMatches: (data) => api.post('/matchmaking/find/', data),
  
  getAvailabilityOverlap: (userId) => api.get(`/matchmaking/availability/${userId}/`),
  
  getProjectSuggestions: () => api.get('/matchmaking/projects/'),
  
  refreshEmbedding: () => api.post('/matchmaking/refresh-embedding/'),
  
  populateProjects: () => api.post('/matchmaking/populate-projects/'),
};

export default api;