import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailFromQuery } from "@/features/auth/components/TokenFromQuery";
import { TokenPendingCard } from "@/features/auth/components/TokenStates";

export const metadata: Metadata = {
  title: "Verify email · AI Commerce",
  description: "Confirm your email address.",
};

/**
 * The post-registration landing page: "check your email" plus the resend
 * action. It also accepts `?token=…`, so verification links sent before the
 * emails moved to the `/verify-email/<token>` path form still resolve.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<TokenPendingCard label="Loading…" />}>
      <VerifyEmailFromQuery />
    </Suspense>
  );
}
