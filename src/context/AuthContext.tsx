'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { SellerProfile, AuthUser } from '../types';
import { getSellerProfileApi } from '../lib/api/seller';

export type AuthState = 'loading' | 'signed-out' | 'signed-in' | 'error';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  sellerProfile: SellerProfile | null;
  loading: boolean;
  authState: AuthState;
  authError: string | null;
  token: string | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  sellerProfile: null,
  loading: true,
  authState: 'loading',
  authError: null,
  token: null,
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        setLoading(true);
        setAuthError(null);

        if (!fbUser) {
          setFirebaseUser(null);
          setUser(null);
          setSellerProfile(null);
          setToken(null);
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
        setToken(null);
        setAuthState('signed-in');

        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);

          const profile = await getSellerProfileApi();
          if (!profile) {
            setAuthError('Seller profile setup is required. Your Firebase account is signed in.');
            return;
          }

          setSellerProfile(profile);
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
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setAuthError('Unable to sign out. Please try again.');
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!firebaseUser) return;

    try {
      const profile = await getSellerProfileApi();
      setSellerProfile(profile);
      if (!profile) {
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
        loading,
        authState,
        authError,
        token,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
