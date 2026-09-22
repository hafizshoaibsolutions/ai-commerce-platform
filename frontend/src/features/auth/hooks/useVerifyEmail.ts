"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getApiErrorStatus } from "@/lib/axios";
import { authApi } from "../services/auth.api";
import { authKeys } from "../services/auth.keys";
import type { VerifyEmailResult, VerifyEmailState } from "../types/auth.types";

/**
 * Confirms an email address from a token in the verification link.
 *
 * Modelled as a mutation rather than a query because it has a side effect on
 * the server and must run exactly once per token — a query would refetch on
 * remount and on window focus.
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation<VerifyEmailResult, unknown, string>({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      // Only matters when the link was opened by someone already signed in: the
      // cached profile still says `isEmailVerified: false`.
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

/**
 * Maps a failed verification onto the failure state the UI renders.
 *
 * The API separates the two by status — 410 for a link that expired, 400 for a
 * malformed one — because its message alone doesn't say which. Anything else
 * (offline, 5xx) falls back to "invalid": both states offer a fresh link, so
 * the copy only has to avoid claiming knowledge it doesn't have.
 */
export function resolveVerifyEmailFailure(
  error: unknown,
): Extract<VerifyEmailState, "expired" | "invalid"> {
  return getApiErrorStatus(error) === 410 ? "expired" : "invalid";
}
