'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../lib/firebase';
import { SellerProfile, AuthUser } from '../types';
import { getSellerProfileApi } from '../lib/api/seller';

export type AuthState = 'loading' | 'signed-out' | 'signed-in' | 'error';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  sellerProfile: SellerProfile | null;
  sellerProfileSetupRequired: boolean;
  loading: boolean;
  authState: AuthState;
  authError: string | null;
  logout: () => Promise<void>;
  refreshProfile: (user?: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  sellerProfile: null,
  sellerProfileSetupRequired: false,
  loading: true,
  authState: 'loading',
  authError: null,
  logout: async () => {},
  refreshProfile: async () => {},
});

const toFriendlyAuthError = (error: unknown, fallback = 'Unable to load your seller profile.') => {
  if (typeof error === 'string') return error;
  const apiError =
    typeof error === 'object' && error !== null
      ? (error as { status?: number; isNetworkError?: boolean })
      : {};

  if (apiError.isNetworkError) {
    return 'The seller service is currently unavailable. Your Firebase account is signed in, but seller details could not be loaded.';
  }

  if (apiError.status === 401 || apiError.status === 403) {
    return 'Your Firebase account is signed in, but the seller service could not verify its profile.';
  }

  return fallback;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [sellerProfileSetupRequired, setSellerProfileSetupRequired] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setFirebaseUser(null);
      setUser(null);
      setSellerProfile(null);
      setSellerProfileSetupRequired(false);
      setAuthState('error');
      setAuthError('Firebase configuration is missing. Add the required NEXT_PUBLIC_FIREBASE_* environment variables to enable sign-in.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        setLoading(true);
        setAuthError(null);

        if (!fbUser) {
          setFirebaseUser(null);
          setUser(null);
          setSellerProfile(null);
          setSellerProfileSetupRequired(false);
          setAuthState('signed-out');
          setLoading(false);
          return;
        }

        setFirebaseUser(fbUser);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
        setSellerProfile(null);
        setSellerProfileSetupRequired(false);
        setAuthState('signed-in');

        try {
          const profile = await getSellerProfileApi(fbUser);
          setSellerProfile(profile);
          setSellerProfileSetupRequired(!profile || profile.profileComplete === false);
          if (!profile || profile.profileComplete === false) {
            setAuthError('Seller profile setup is required. Your Firebase account is signed in.');
            return;
          }

          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: 'seller',
            isSeller: true,
          });
        } catch (error) {
          setSellerProfile(null);
          setSellerProfileSetupRequired(false);
          setAuthError(toFriendlyAuthError(error));
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setAuthState('error');
        setAuthError(toFriendlyAuthError(error, 'Unable to read your Firebase sign-in state.'));
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!hasFirebaseConfig) {
      setAuthState('error');
      setAuthError('Firebase configuration is missing. Add the required NEXT_PUBLIC_FIREBASE_* environment variables to enable sign-in.');
      return;
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setAuthError('Unable to sign out. Please try again.');
      throw error;
    }
  };

  const refreshProfile = async (user: User | null = firebaseUser) => {
    if (!user) return;

    try {
      const profile = await getSellerProfileApi(user);
      setSellerProfile(profile);
      setSellerProfileSetupRequired(!profile || profile.profileComplete === false);
      if (!profile || profile.profileComplete === false) {
        setAuthError('Seller profile setup is required. Your Firebase account is signed in.');
        return;
      }

      setAuthError(null);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: prev.displayName || profile.ownerName || null,
              role: 'seller',
              isSeller: true,
            }
          : prev,
      );
    } catch (error) {
      setSellerProfile(null);
      setSellerProfileSetupRequired(false);
      setAuthError(toFriendlyAuthError(error));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        sellerProfile,
        sellerProfileSetupRequired,
        loading,
        authState,
        authError,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
