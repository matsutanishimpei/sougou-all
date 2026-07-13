import { createContext } from 'react';
import type { UserProfile } from '../types';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

export interface AuthContextValue extends AuthState {
  loginWithGitHub: () => Promise<void>;
  logout: () => void;
  loginAsGuest: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
