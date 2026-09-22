"use client";

import { useMutation } from "@tanstack/react-query";

import { authApi } from "../services/auth.api";
import type { ForgotPasswordPayload } from "../types/auth.types";

/**
 * Requests a password reset link.
 *
 * The API always responds 200, even for an unknown address, so the UI must show
 * the same neutral confirmation either way — otherwise the form becomes an
 * account-enumeration oracle.
 */
export function useForgotPassword() {
  return useMutation<void, unknown, ForgotPasswordPayload>({
    mutationFn: authApi.forgotPassword,
  });
}
