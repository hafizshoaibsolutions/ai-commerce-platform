import type { Metadata } from "next";
import { Suspense } from "react";

import {
  ResetPasswordFromQuery,
  VerifyEmailFromQuery,
} from "@/features/auth/components/TokenFromQuery";
import { TokenPendingCard } from "@/features/auth/components/TokenStates";

export const metadata: Metadata = {
  title: "Reset password · AI Commerce",
  description: "Choose a new password for your AI Commerce account.",
};

/**
 * Backend-compatible route: the reset email links to `/reset-password?token=…`.
 * The `[token]` sibling handles the path-segment form.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<TokenPendingCard label="Loading your reset link…" />}>
      <ResetPasswordFromQuery />
    </Suspense>
  );
}
