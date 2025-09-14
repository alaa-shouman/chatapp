import { RootState } from '@/redux/store';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();

  // Get auth state from Redux
  const { isAuthenticated, access_token } = useSelector((state: RootState) => state.auth);

  // Consider loading if we're waiting for token persistence to complete
  const isLoading = false; // You can add loading logic here if needed

  useEffect(() => {
    // Check if we're in an auth route
    const inAuthGroup = segments[0] === '(auth)';

    console.log('Auth state changed:', { isAuthenticated, segments, inAuthGroup });

    if (isAuthenticated) {
      // User is authenticated, redirect to tabs if they're in auth routes
      if (inAuthGroup) {
        router.replace('/(tabs)/profile');
      }
    } else {
      // User is not authenticated, redirect to auth if they're not already there
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, segments]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};