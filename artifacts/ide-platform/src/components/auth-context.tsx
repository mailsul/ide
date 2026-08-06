import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("ide_token"));
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error, refetch } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: ["/api/auth/me", token],
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      setToken(null);
      localStorage.removeItem("ide_token");
    }
  }, [error]);

  const login = (newToken: string) => {
    localStorage.setItem("ide_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("ide_token");
    setToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isLoading && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
