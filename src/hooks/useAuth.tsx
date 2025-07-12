
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

const USERNAME_KEY = "app_username";
const PASSWORD_HASH_KEY = "app_password_hash";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, passwordHash: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    try {
      const username = localStorage.getItem(USERNAME_KEY);
      const hash = localStorage.getItem(PASSWORD_HASH_KEY);
      if (username && hash) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Could not access local storage:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Listen to storage changes to sync across tabs
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [checkAuth]);

  const login = useCallback((username: string, passwordHash: string) => {
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(PASSWORD_HASH_KEY, passwordHash);
    setIsAuthenticated(true);
    router.push("/admin");
  }, [router]);

  const logout = useCallback(async () => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(PASSWORD_HASH_KEY);
    setIsAuthenticated(false);
    // Use replace to prevent user from navigating back to the protected page
    router.replace("/admin/login");
  }, [router]);

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
