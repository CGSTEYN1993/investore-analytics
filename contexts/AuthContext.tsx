"use client";
/**
 * InvestOre Analytics - Authentication Context & Provider
 * 
 * Provides authentication state management across the application.
 * Handles token storage, refresh, and user session.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  subscription_tier: string;
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Token storage helper
const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
  },
  
  setTokens: (accessToken: string, refreshToken: string, persistent: boolean) => {
    if (typeof window === "undefined") return;
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem("access_token", accessToken);
    storage.setItem("refresh_token", refreshToken);
  },
  
  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user profile
  const fetchUser = useCallback(async (): Promise<User | null> => {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      // If 401, try to refresh
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return fetchUser();
        }
      }
      
      return null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }, []);

  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    const refresh = tokenStorage.getRefreshToken();
    if (!refresh) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh })
      });

      if (response.ok) {
        const data = await response.json();
        // Determine if persistent based on where old token was stored
        const isPersistent = !!localStorage.getItem("refresh_token");
        tokenStorage.setTokens(data.access_token, data.refresh_token, isPersistent);
        return true;
      }

      // Refresh failed - clear tokens
      tokenStorage.clearTokens();
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      tokenStorage.clearTokens();
      return false;
    }
  };

  // Login
  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    tokenStorage.setTokens(data.access_token, data.refresh_token, rememberMe);
    
    const userData = await fetchUser();
    setUser(userData);
  };

  // Logout
  const logout = async (): Promise<void> => {
    const token = tokenStorage.getAccessToken();
    
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    tokenStorage.clearTokens();
    setUser(null);
    router.push("/auth/login");
  };

  // Get access token for API calls
  const getAccessToken = (): string | null => {
    return tokenStorage.getAccessToken();
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const userData = await fetchUser();
      setUser(userData);
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  // Set up token refresh interval
  useEffect(() => {
    // Refresh token every 14 minutes (before 15 min expiry)
    const interval = setInterval(() => {
      if (tokenStorage.getAccessToken()) {
        refreshToken();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected route wrapper component
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?returnUrl=" + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
