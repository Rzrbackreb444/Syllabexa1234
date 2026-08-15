import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './googleAuth'; // Your existing firebase config

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  activePlan: 'free' | 'pro' | 'enterprise';
  wordGoal: number;
  computeCredits?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, isPro: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Real-time sync with Firestore User Document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: data.displayName || firebaseUser.displayName,
              activePlan: data.activePlan || 'free',
              wordGoal: data.wordGoal || 1000,
              computeCredits: data.computeCredits || 0,
            });
          } else {
             // Default profile if doesn't exist yet
             setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              activePlan: 'free',
              wordGoal: 1000,
              computeCredits: 5,
            });
          }
          setLoading(false);
        }, () => {
          // Offline fallback
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Syllabexa Author',
            activePlan: 'free',
            wordGoal: 1000,
            computeCredits: 5,
          });
          setLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const isPro = true; // Instant full access for all signed-in users

  return (
    <AuthContext.Provider value={{ user, profile, loading, isPro }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
