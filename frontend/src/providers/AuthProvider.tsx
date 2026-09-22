"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  refreshAccessToken,
  setAccessToken as setTokenInAxios,
  setSessionExpiredHandler,
} from "@/lib/axios";
import { authApi } from "@/features/auth/services/auth.api";
import { authKeys } from "@/features/auth/services/auth.keys";
import type {
  UserProfile,
  UserRole,
} from "@/features/auth/types/auth.types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  /** In-memory token. Also mirrored into the axios instance by setAccessToken. */
  accessToken: string | null;
  /** Profile from `GET /users/profile`, or null when signed out or loading. */
  user: UserProfile | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** True while the session is being restored or the profile is loading. */
  isLoading: boolean;
  isAdmin: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  /** Stores a token from login/register and triggers the profile fetch. */
  setAccessToken: (accessToken: string) => void;
  /** Drops the token and clears every cached query. */
  clearAccessToken: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const setAccessToken = useCallback((token: string) => {
    // Module store first: the axios interceptor reads it synchronously, so a
    // request fired immediately after this already carries the header.
    setTokenInAxios(token);
    setAccessTokenState(token);
  }, []);

  const clearAccessToken = useCallback(() => {
    setTokenInAxios(null);
    setAccessTokenState(null);
    // Cached data may belong to the user who just signed out (cart, orders).
    // The cache is global, so wipe all of it rather than guessing what is theirs.
    queryClient.clear();
  }, [queryClient]);

  // Restore the session on mount: exchange the httpOnly refreshToken cookie for
  // a fresh access token. This is what keeps a page reload signed in, and why
  // nothing is ever written to localStorage.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await refreshAccessToken();
        if (!cancelled) setAccessToken(token);
      } catch {
        // No cookie, or it was revoked/expired — an anonymous visitor.
        if (!cancelled) clearAccessToken();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setAccessToken, clearAccessToken]);

  // Let the axios interceptor end the session when a mid-flight refresh fails.
  useEffect(() => {
    setSessionExpiredHandler(clearAccessToken);

    return () => setSessionExpiredHandler(null);
  }, [clearAccessToken]);

  const { data: user = null, isPending } = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.getCurrentUser,
    // Wait for the bootstrap to settle so an anonymous visitor never fires a
    // guaranteed 401.
    enabled: !isBootstrapping && accessToken !== null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const status: AuthStatus = isBootstrapping
    ? "loading"
    : accessToken
      ? "authenticated"
      : "unauthenticated";

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading" || (accessToken !== null && isPending),
      isAdmin: user?.role === "admin",
      hasRole,
      setAccessToken,
      clearAccessToken,
    }),
    [
      accessToken,
      user,
      status,
      isPending,
      hasRole,
      setAccessToken,
      clearAccessToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
