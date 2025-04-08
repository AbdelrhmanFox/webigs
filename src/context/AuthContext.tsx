import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { User } from '../types';
import { mockAuth } from '../services/mockAuth';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || user.email!.split('@')[0]
        });
      } else {
        // Check mock auth if Firebase auth fails
        const mockUser = mockAuth.getCurrentUser();
        if (mockUser) {
          setCurrentUser({
            uid: 'mock-' + mockUser.email,
            email: mockUser.email,
            displayName: mockUser.name
          });
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try Firebase auth first
      await auth.signInWithEmailAndPassword(email, password);
    } catch (firebaseError) {
      // Fallback to mock auth if Firebase fails
      const result = mockAuth.login(email, password);
      if (!result.success) {
        throw new Error('Invalid credentials');
      }
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } finally {
      mockAuth.logout();
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}