"use client";

import { useMutation } from "@tanstack/react-query";

import { useAppDispatch } from "@/store/hooks";
import { setNotice } from "@/store/slices/ui.slice";
import { authApi } from "../services/auth.api";
import type { RegisterPayload, RegisterResult } from "../types/auth.types";

/**
 * Creates an account.
 *
 * Registration deliberately does **not** start a session, even though the API
 * hands back an access token and sets the refreshToken cookie. Signing in an
 * account that hasn't confirmed its address yet would put a live session behind
 * an unverified email: `GuestRoute` would bounce the new user straight past
 * /login to /profile, and the verification link would be left with nothing to
 * guard. The flow is register → confirm → sign in.
 *
 * So the session the API just issued is revoked here. `logout` is the endpoint
 * that does that, and it reads the refreshToken cookie directly — no
 * Authorization header, so it works before a token is ever stored. A failure is
 * swallowed: it usually means the cookie was never available to begin with
 * (blocked cross-site storage in dev), and the caller has no way to act on it.
 *
 * Navigation is left to the caller — `RegisterForm` sends the visitor to
 * /verify-email, which owns the "check your email" copy and the resend action.
 */
export function useRegister() {
  const dispatch = useAppDispatch();

  return useMutation<RegisterResult, unknown, RegisterPayload>({
    mutationFn: async (payload) => {
      const result = await authApi.register(payload);

      await authApi.logout().catch(() => {
        // Best effort — see the note above.
      });

      return result;
    },
    onSuccess: (data) => {
      // The account exists either way, so a mail failure is a notice rather
      // than an error. It has to survive the redirect to /verify-email to be
      // seen, which is exactly what the Redux notice is for.
      if (!data.emailSent) {
        dispatch(
          setNotice({
            message:
              "Your account was created, but the verification email couldn't be sent. Use the button below to try again.",
            variant: "destructive",
          }),
        );
      }
    },
  });
}
