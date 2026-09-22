"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/AuthProvider";
import { authApi } from "../services/auth.api";
import { authKeys } from "../services/auth.keys";
import type { LoginPayload, LoginResult } from "../types/auth.types";

/**
 * Signs the user in.
 *
 * Navigation is intentionally absent: `GuestRoute` already redirects once
 * `isAuthenticated` flips, using the destination `ProtectedRoute` recorded. That
 * keeps redirect logic in exactly one place.
 */
export function useLogin() {
  const { setAccessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<LoginResult, unknown, LoginPayload>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);

      // The login payload only carries a trimmed user (id, name, email, role),
      // so pull the full profile rather than splitting the user type in two.
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}
