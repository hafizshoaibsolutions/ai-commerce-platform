"use client";

import { useMutation } from "@tanstack/react-query";

import { authApi } from "../services/auth.api";
import type { ResendVerificationPayload } from "../types/auth.types";

/**
 * Requests a fresh verification link.
 *
 * The API answers 200 for every address it is given, including ones with no
 * account, so a resolved mutation does **not** mean an email was sent. Callers
 * must word their confirmation accordingly — "if that address still needs
 * verifying, a link is on its way" — rather than promising delivery.
 */
export function useResendVerification() {
  return useMutation<void, unknown, ResendVerificationPayload>({
    mutationFn: authApi.resendVerification,
  });
}
