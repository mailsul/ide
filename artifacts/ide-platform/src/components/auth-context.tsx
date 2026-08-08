import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { getStoredToken, storeToken, clearToken } from "@/lib/token-storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  /**
   * Alasan sesi ditolak/diputus. Diisi ketika token ada tapi `/auth/me`
   * gagal, supaya halaman login bisa menjelaskan kenapa user dipantulkan
   * balik alih-alih terlihat "stuck" tanpa pesan apa pun.
   */
  sessionError: string | null;
  clearSessionError: () => void;
  login: (token: string, rememberMe?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  sessionError: null,
  clearSessionError: () => {},
  login: () => {},
  logout: () => {},
});

function describeSessionError(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;

  if (status === 401 || status === 403) {
    return "Sesi kamu sudah tidak berlaku. Silakan masuk lagi.";
  }
  if (typeof status === "number" && status >= 500) {
    return "Server sedang bermasalah saat memverifikasi sesi. Coba lagi sebentar lagi.";
  }
  if (status === undefined) {
    return "Tidak bisa menghubungi server API. Periksa koneksi atau status service backend.";
  }
  return `Verifikasi sesi gagal (HTTP ${status}). Silakan masuk lagi.`;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: ["/api/auth/me", token],
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      setSessionError(describeSessionError(error));
      clearToken();
      setToken(null);
    }
  }, [error]);

  const login = (newToken: string, rememberMe: boolean = false) => {
    setSessionError(null);
    storeToken(newToken, rememberMe);
    setToken(newToken);
  };

  const logout = () => {
    setSessionError(null);
    clearToken();
    setToken(null);
    setLocation("/login");
  };

  const clearSessionError = () => setSessionError(null);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading && !!token,
        sessionError,
        clearSessionError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
