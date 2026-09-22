"use client";

import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/providers/AuthProvider";
import { useAppDispatch } from "@/store/hooks";
import { setNotice } from "@/store/slices/ui.slice";
import { authApi } from "../services/auth.api";
import type { ResetPasswordPayload } from "../types/auth.types";

/**
 * Completes a password reset.
 *
 * The backend clears every stored refresh token for the user, so any existing
 * session is dead the moment this succeeds — including this browser's. Local
 * auth state is therefore cleared too, otherwise the UI would look signed in
 * while every request 401s.
 */
export function useResetPassword() {
  const { clearAccessToken } = useAuth();
  const dispatch = useAppDispatch();

  return useMutation<void, unknown, ResetPasswordPayload>({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      clearAccessToken();
      dispatch(
        setNotice({
          message:
            "Your password has been reset. Please sign in with the new one.",
          variant: "success",
        }),
      );
    },
  });
}
