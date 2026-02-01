'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsProfileSetup: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  needsProfileSetup: false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Only check if profile setup is needed if the user was just created
          // Check metadata to see if this is a new user (created within last 5 minutes)
          const creationTime = user.metadata.creationTime;
          const isNewUser = creationTime && (Date.now() - new Date(creationTime).getTime()) < 5 * 60 * 1000;
          
          const needsSetup = Boolean(isNewUser && (!userData.displayName || !userData.githubUsername));
          setNeedsProfileSetup(needsSetup);
        }
      } else {
        setNeedsProfileSetup(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, needsProfileSetup }}>
      {children}
    </AuthContext.Provider>
  );
};

