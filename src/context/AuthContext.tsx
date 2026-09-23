'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { SellerProfile, AuthUser, UserRole } from '../types';
import { getSellerProfileApi } from '../lib/api/seller';
import { INITIAL_MOCK_SELLER } from '../lib/mockData';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  sellerProfile: SellerProfile | null;
  loading: boolean;
  token: string | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  sellerProfile: null,
  loading: true,
  token: null,
  logout: async () => {},
  refreshProfile: async () => {},
  setDemoUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSellerData = async (uid: string, emailStr: string | null, nameStr: string | null) => {
    try {
      const profile = await getSellerProfileApi();
      setSellerProfile(profile);

      setUser({
        uid,
        email: emailStr || 'seller@fitnessspecies.com',
        displayName: nameStr || profile?.ownerName || 'Fitness Species Seller',
        role: profile ? 'seller' : 'customer',
        isSeller: true,
      });
    } catch (err) {
      console.warn('Error loading seller data:', err);
      // Fallback demo seller setup
      setSellerProfile(INITIAL_MOCK_SELLER);
      setUser({
        uid: uid || 'demo_seller_uid_901',
        email: 'alex@apexnutrition.com',
        displayName: 'Alex Rivera',
        role: 'seller',
        isSeller: true,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
        await loadSellerData(fbUser.uid, fbUser.email, fbUser.displayName);
      } else {
        // Fallback to active demo session so user can explore portal immediately without blocking
        setToken('demo_token');
        setSellerProfile(INITIAL_MOCK_SELLER);
        setUser({
          uid: 'demo_seller_uid_901',
          email: 'alex@apexnutrition.com',
          displayName: 'Alex Rivera (Apex Nutrition)',
          role: 'seller',
          isSeller: true,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setSellerProfile(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getSellerProfileApi();
      setSellerProfile(profile);
    }
  };

  const setDemoUser = (role: UserRole) => {
    setUser({
      uid: 'demo_seller_uid_901',
      email: 'alex@apexnutrition.com',
      displayName: 'Alex Rivera (Apex Nutrition)',
      role,
      isSeller: role === 'seller' || role === 'admin',
    });
    setSellerProfile({
      ...INITIAL_MOCK_SELLER,
      status: role === 'seller' ? 'approved' : 'pending',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        sellerProfile,
        loading,
        token,
        logout,
        refreshProfile,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
