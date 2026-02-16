/**
 * InvestOre Analytics - Auth Provider
 * 
 * Provides secure authentication context and utilities:
 * - Token management (storage, refresh, validation)
 * - User state management
 * - Session persistence
 * - Automatic token refresh
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getPublicApiV1Url } from '@/lib/public-api-url';
import Cookies from 'js-cookie';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'viewer' | 'analyst' | 'admin';
  subscription_tier: 'free' | 'analyst' | 'enterprise';
  is_verified?: boolean;
  created_at?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const API_URL = getPublicApiV1Url();
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Token Utilities
// ============================================================================

function setTokens(tokens: AuthTokens, rememberMe: boolean = true): void {
  const options = {
    ...COOKIE_OPTIONS,
    expires: rememberMe ? 7 : undefined, // 7 days if remember me, session only otherwise
  };
  
  Cookies.set('access_token', tokens.access_token, {
    ...options,
    expires: tokens.expires_in ? tokens.expires_in / 86400 : 1, // Convert seconds to days
  });
  
  Cookies.set('refresh_token', tokens.refresh_token, {
    ...options,
    expires: rememberMe ? 30 : 7, // Refresh token lasts longer
  });
}

function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: Cookies.get('access_token') || null,
    refreshToken: Cookies.get('refresh_token') || null,
  };
}

function clearTokens(): void {
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
}

function decodeToken(token: string): { exp: number; sub: string; email: string; role: string; tier: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return {
      exp: payload.exp,
      sub: payload.sub,
      email: payload.email,
      role: payload.role || 'viewer',
      tier: payload.tier || 'free',
    };
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const now = Date.now();
  const expiry = decoded.exp * 1000;
  
  return expiry - now < TOKEN_REFRESH_THRESHOLD_MS;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Fetch current user from token
  const fetchUser = useCallback(async (accessToken: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          clearTokens();
          return null;
        }
        throw new Error('Failed to fetch user');
      }
      
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<AuthTokens | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (!response.ok) {
        clearTokens();
        return null;
      }
      
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  // Initialize auth state from stored tokens
  const initializeAuth = useCallback(async () => {
    const { accessToken, refreshToken } = getTokens();
    
    if (!accessToken) {
      setState(s => ({ ...s, isLoading: false, isAuthenticated: false }));
      return;
    }
    
    // Check if token is expiring soon and refresh if needed
    if (isTokenExpiringSoon(accessToken) && refreshToken) {
      const newTokens = await refreshAccessToken(refreshToken);
      if (newTokens) {
        setTokens(newTokens, true);
        const user = await fetchUser(newTokens.access_token);
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
        return;
      }
    }
    
    // Use existing token
    const user = await fetchUser(accessToken);
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  }, [fetchUser, refreshAccessToken]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!state.isAuthenticated) return;
    
    const checkTokenInterval = setInterval(async () => {
      const { accessToken, refreshToken } = getTokens();
      
      if (accessToken && refreshToken && isTokenExpiringSoon(accessToken)) {
        const newTokens = await refreshAccessToken(refreshToken);
        if (newTokens) {
          setTokens(newTokens, true);
        } else {
          // Token refresh failed, log out
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please log in again.',
          });
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkTokenInterval);
  }, [state.isAuthenticated, refreshAccessToken]);

  // Login handler
  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Invalid credentials');
      }
      
      const tokens: AuthTokens = await response.json();
      setTokens(tokens, rememberMe);
      
      const user = await fetchUser(tokens.access_token);
      
      if (!user) {
        throw new Error('Failed to fetch user data');
      }
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Redirect to intended destination or analysis
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/analysis');
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      }));
      throw err;
    }
  };

  // Register handler
  const register = async (email: string, password: string, fullName?: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          full_name: fullName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      // Auto-login after registration
      await login(email, password, true);
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Registration failed',
      }));
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    setState(s => ({ ...s, isLoading: true }));
    
    try {
      const { accessToken } = getTokens();
      
      if (accessToken) {
        // Attempt to invalidate token on server (non-blocking)
        fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }).catch(() => {
          // Ignore errors - we're logging out anyway
        });
      }
    } finally {
      clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    }
  };

  // Refresh auth state
  const refreshAuth = async () => {
    await initializeAuth();
  };

  // Clear error
  const clearError = () => {
    setState(s => ({ ...s, error: null }));
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'viewer' | 'analyst' | 'admin';
  requiredTier?: 'free' | 'analyst' | 'enterprise';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredTier,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}&reason=auth_required`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);
  
  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  // Check role if required
  if (requiredRole && user) {
    const roleHierarchy = { viewer: 0, analyst: 1, admin: 2 };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center max-w-md p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-slate-400 mb-6">
              You don&apos;t have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/analysis')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }
  
  // Check tier if required
  if (requiredTier && user) {
    const tierHierarchy = { free: 0, analyst: 1, enterprise: 2 };
    const userTierLevel = tierHierarchy[user.subscription_tier] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 0;
    
    if (userTierLevel < requiredTierLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center max-w-md p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upgrade Required</h2>
            <p className="text-slate-400 mb-6">
              This feature requires a {requiredTier} subscription.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      );
    }
  }
  
  return <>{children}</>;
}

// ============================================================================
// Utility Export
// ============================================================================

export { getTokens, clearTokens };
