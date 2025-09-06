import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MatchmakingPage from './pages/MatchmakingPage';
import TeamsPage from './pages/TeamsPage';
import HeatmapPage from './pages/HeatmapPage';
import Navbar from './components/Navbar';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="brand.500" mb={4} />
          <Text>Loading QuickSync...</Text>
        </Box>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Text color="red.500" fontSize="lg" mb={4}>
            Error: {error}
          </Text>
          <Text color="gray.500">
            Please refresh the page and try again.
          </Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/profile" replace /> : <LoginPage />} 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/matchmaking" 
          element={
            <ProtectedRoute>
              <MatchmakingPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teams" 
          element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/heatmap" 
          element={
            <ProtectedRoute>
              <HeatmapPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={<Navigate to={user ? "/profile" : "/login"} replace />} 
        />
        
        <Route 
          path="*" 
          element={
            <Center h="50vh">
              <Text fontSize="xl" color="gray.500">
                Page not found
              </Text>
            </Center>
          } 
        />
      </Routes>
    </Box>
  );
}

export default App;