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
    api.post('/api/auth/sync-firebase/', { firebase_uid: firebaseUID, user_data: userData }),

  getProfile: (firebaseUID) =>
    api.get(`/api/auth/profile/?firebase_uid=${firebaseUID}`),

  updateProfile: (firebaseUID, data) =>
    api.patch('/api/auth/profile/', { ...data, firebase_uid: firebaseUID }),

  getUsers: () => api.get('/api/auth/users/'),
};

// Teams API  
export const teamsAPI = {
  getTeams: () => api.get('/api/teams/'),
  
  createTeam: (data) => api.post('/api/teams/', data),
  
  getTeam: (id) => api.get(`/api/teams/${id}/`),
  
  updateTeam: (id, data) => api.patch(`/api/teams/${id}/`, data),
  
  deleteTeam: (id) => api.delete(`/api/teams/${id}/`),
  
  getUserTeams: (firebase_uid) => api.get(`/api/teams/my-teams/?firebase_uid=${firebase_uid}`),
  
  getInvitations: (firebase_uid) => api.get(`/api/teams/invitations/?firebase_uid=${firebase_uid}`),
  
  sendInvitation: (teamId, data) => api.post(`/api/teams/${teamId}/invite/`, data),
  
  respondToInvitation: (invitationId, action, role, firebase_uid) => 
  api.post(`/api/teams/invitations/${invitationId}/respond/`, { action, role, firebase_uid }),
};

// Matchmaking API
export const matchmakingAPI = {
  findMatches: (data) => api.post('/api/matchmaking/find/', data),
  
  getAvailabilityOverlap: (userId) => api.get(`/api/matchmaking/availability/${userId}/`),
  
  getProjectSuggestions: () => api.get('/api/matchmaking/projects/'),
  
  refreshEmbedding: () => api.post('/api/matchmaking/refresh-embedding/'),
  
  populateProjects: () => api.post('/api/matchmaking/populate-projects/'),

  // Hugging Face recommendations for a given UID
  getRecommendations: (uid) => api.get(`/api/matchmaking/recommendations/?uid=${uid}`),
};

export default api;