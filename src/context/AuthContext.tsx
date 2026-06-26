/**
 * AuthContext - GitHub OAuth authentication state management.
 *
 * Handles actual GitHub OAuth flow including redirect, code exchange via local proxy,
 * user profile retrieval from GitHub API, and persistence via localStorage.
 */
import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '../types';

// ── State & Actions ──────────────────────────────────────────────────

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** GitHub access token – used for private repo API calls. */
  accessToken: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserProfile; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

// Initialize loading as true if we have a token or a redirect code to process to avoid page flash
const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('gitHubToken');
const hasCode = typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('code');

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: hasToken || hasCode,
  accessToken: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        accessToken: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  loginWithGitHub: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Helper to fetch profile from GitHub API
async function fetchGitHubProfile(token: string): Promise<UserProfile> {
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) {
    throw new Error(`GitHub API returned status ${userRes.status}`);
  }
  const ghUser = await userRes.json();
  return {
    displayName: ghUser.name || ghUser.login,
    email: ghUser.email || '',
    photoURL: ghUser.avatar_url || '',
  };
}

// ── Provider ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Redirect user to GitHub OAuth Page
  const loginWithGitHub = useCallback(async () => {
    dispatch({ type: 'LOGIN_START' });
    const clientId = 'Ov23liFWupK3e2e4v6IF';
    const redirectUri = window.location.origin;
    window.location.href =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${clientId}&scope=repo,read:user,user:email` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gitHubToken');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Handle OAuth Callback & Session Restoration on Mount
  useEffect(() => {
    const handleAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');

      if (code) {
        // Exchange code for token via our local proxy
        try {
          dispatch({ type: 'LOGIN_START' });
          const res = await fetch('/api/github/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!res.ok) throw new Error('Token exchange failed');
          const data = await res.json();

          if (data.error) {
            throw new Error(data.error_description || data.error);
          }

          const token = data.access_token;
          if (!token) throw new Error('No access token in response');

          // Fetch user profile using the token
          const user = await fetchGitHubProfile(token);

          // Save token to localStorage for persistence
          localStorage.setItem('gitHubToken', token);

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('Authentication error:', error);
          dispatch({ type: 'LOGIN_FAILURE' });
        } finally {
          // Clean the code parameter from URL
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      } else {
        // Check if there is an existing token in localStorage
        const storedToken = localStorage.getItem('gitHubToken');
        if (storedToken) {
          try {
            const user = await fetchGitHubProfile(storedToken);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token: storedToken },
            });
          } catch (error) {
            console.error('Session restoration failed, clearing token:', error);
            localStorage.removeItem('gitHubToken');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        }
      }
    };

    handleAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loginWithGitHub, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
