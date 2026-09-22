"use client";

import { useSearchParams } from "next/navigation";

import { CheckEmailCard } from "./CheckEmailCard";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { MissingTokenCard } from "./TokenStates";
import { VerifyEmailStatus } from "./VerifyEmailStatus";

/**
 * Client-side readers for the query-string form of the email links.
 *
 * `/verify-email` serves two arrivals, so it reads both params:
 *
 *   ?token=…  an older verification email, whose link carries the token in the
 *             query string. Current emails use the `/verify-email/<token>` path
 *             form, but links already sitting in inboxes still work.
 *   ?email=…  the post-registration hand-off, with no token — the visitor has
 *             been told to check their email and gets the resend action.
 *
 * `/reset-password?token=…` is what the backend still sends for resets.
 *
 * These are separate components rather than a render-prop wrapper because a
 * server component cannot pass a function down to a client one — the page stays
 * a server component so it can still export `metadata`.
 *
 * `useSearchParams` forces client rendering, so each must sit inside `<Suspense>`
 * or the production build fails.
 */

export function VerifyEmailFromQuery() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (token) {
    return <VerifyEmailStatus token={token} />;
  }

  return <CheckEmailCard email={searchParams.get("email")} />;
}

export function ResetPasswordFromQuery() {
  const token = useSearchParams().get("token");

  if (!token) {
    return (
      <MissingTokenCard
        title="Reset link incomplete"
        description="We couldn't find a reset token in this link."
        actionHref="/forgot-password"
        actionLabel="Request a new link"
      />
    );
  }

  return <ResetPasswordForm token={token} />;
}
