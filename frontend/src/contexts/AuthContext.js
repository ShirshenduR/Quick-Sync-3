import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseConfig, API_BASE_URL } from '../config';

// Development mode flag
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development' && 
  (!process.env.REACT_APP_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY === 'your_firebase_api_key');

let auth = null;
let googleProvider = null;

if (!DEVELOPMENT_MODE) {
  try {
    const { initializeApp } = require('firebase/app');
    const {
      getAuth,
      GoogleAuthProvider,
    } = require('firebase/auth');
    
    // Initialize Firebase only if config is valid
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization failed, using development mode:', error.message);
  }
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (DEVELOPMENT_MODE) {
      // Development mode - simulate authentication
      console.log('Running in development mode - simulating authentication');
      setTimeout(() => {
        setUser({
          uid: 'dev-user-123',
          email: 'developer@quicksync.dev',
          displayName: 'Development User',
          photoURL: null
        });
        setLoading(false);
      }, 1000);
      
      return () => {}; // No cleanup needed
    }

    // Production Firebase authentication
    if (!auth) {
      setError('Firebase not properly configured');
      setLoading(false);
      return () => {};
    }

    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        if (firebaseUser) {
          // Sync with Django backend
          const response = await fetch(`${API_BASE_URL}/auth/sync-firebase/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
            },
            body: JSON.stringify({
              firebase_uid: firebaseUser.uid,
              user_data: {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL
              }
            })
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({ ...firebaseUser, ...userData });
          } else {
            throw new Error('Failed to sync with backend');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (DEVELOPMENT_MODE) {
      // Development mode - simulate Google login
      setLoading(true);
      setTimeout(() => {
        setUser({
          uid: 'dev-user-123',
          email: 'developer@quicksync.dev',
          displayName: 'Development User',
          photoURL: null
        });
        setLoading(false);
      }, 1000);
      return;
    }

    if (!auth || !googleProvider) {
      throw new Error('Firebase not properly configured');
    }

    try {
      setError(null);
      setLoading(true);
      const { signInWithPopup } = require('firebase/auth');
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (DEVELOPMENT_MODE) {
      setUser(null);
      return;
    }

    if (!auth) {
      throw new Error('Firebase not properly configured');
    }

    try {
      setError(null);
      const { signOut } = require('firebase/auth');
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};