
// src/hooks/useAuth.tsx
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

  // Runs once on component mount to check auth status from localStorage
  useEffect(() => {
    try {
      const username = localStorage.getItem(USERNAME_KEY);
      const hash = localStorage.getItem(PASSWORD_HASH_KEY);
      if (username && hash) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((username: string, passwordHash: string) => {
    try {
        localStorage.setItem(USERNAME_KEY, username);
        localStorage.setItem(PASSWORD_HASH_KEY, passwordHash);
        setIsAuthenticated(true);
        router.replace("/admin");
    } catch (error) {
        console.error("Could not access localStorage:", error);
        toast({ title: "Login Error", description: "Could not save session. Please enable cookies/localStorage.", variant: "destructive" });
    }
  }, [router]);

  const logout = useCallback(() => {
    try {
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem(PASSWORD_HASH_KEY);
        setIsAuthenticated(false);
        router.replace("/admin/login");
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
  }, [router]);
  
  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === USERNAME_KEY || event.key === PASSWORD_HASH_KEY) {
            try {
                const username = localStorage.getItem(USERNAME_KEY);
                const hash = localStorage.getItem(PASSWORD_HASH_KEY);
                const currentlyAuth = !!(username && hash);
                if (isAuthenticated !== currentlyAuth) {
                    setIsAuthenticated(currentlyAuth);
                    if (!currentlyAuth) {
                        router.replace('/admin/login');
                    }
                }
            } catch (error) {
                console.error("Could not access localStorage:", error);
                setIsAuthenticated(false);
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, router]);

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
