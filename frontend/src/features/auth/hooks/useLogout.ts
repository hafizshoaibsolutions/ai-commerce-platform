"use client";

import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/providers/AuthProvider";
import { authApi } from "../services/auth.api";

/**
 * Signs the user out.
 *
 * Local state is cleared in `onSettled`, not `onSuccess`, so a failed or
 * unreachable API never leaves the UI stuck signed in. `clearAccessToken` also
 * wipes cached queries, which is what stops the next user seeing the previous
 * one's cart or orders.
 */
export function useLogout() {
  const { clearAccessToken } = useAuth();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => clearAccessToken(),
  });
}
