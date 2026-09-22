"use client";

import { CircleCheckIcon, MailWarningIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingButton } from "@/components/ui/loading-button";
import { getApiErrorMessage } from "@/lib/axios";
import { useAuth } from "@/providers/AuthProvider";
import { useResendVerification } from "../hooks/useResendVerification";

/**
 * Prompt for a signed-in user whose address is still unconfirmed.
 *
 * The API accepts a sign-in from an unverified account, so /profile is
 * reachable without ever opening the verification email. This is the way back
 * to that step — a nudge, not a gate. Blocking the page would be policy the
 * API doesn't enforce, so the UI doesn't invent it either.
 *
 * Renders nothing once the address is confirmed, which means it disappears on
 * its own the next time the profile query refreshes after verification.
 */
export function UnverifiedEmailBanner() {
  const { user } = useAuth();
  const resend = useResendVerification();
  const [error, setError] = useState<string | null>(null);

  if (!user || user.isEmailVerified) return null;

  const onResend = async () => {
    setError(null);

    try {
      await resend.mutateAsync({ email: user.email });
    } catch (caught) {
      setError(getApiErrorMessage(caught, "Unable to send a new link."));
    }
  };

  return (
    <Alert variant={resend.isSuccess ? "success" : "destructive"}>
      {resend.isSuccess ? <CircleCheckIcon /> : <MailWarningIcon />}
      <AlertTitle>
        {resend.isSuccess
          ? "Verification link sent"
          : "Confirm your email address"}
      </AlertTitle>
      <AlertDescription className="w-full gap-3">
        <p className="leading-relaxed">
          {resend.isSuccess ? (
            <>
              If <span className="font-medium">{user.email}</span> still needs
              verifying, a new link is on its way. It expires in 10 minutes.
            </>
          ) : (
            <>
              We sent a link to{" "}
              <span className="font-medium">{user.email}</span>. Your account
              works, but the address stays unconfirmed until you follow it.
            </>
          )}
        </p>

        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : null}

        {resend.isSuccess ? null : (
          <LoadingButton
            type="button"
            size="sm"
            variant="outline"
            loading={resend.isPending}
            onClick={onResend}
          >
            {resend.isPending ? "Sending…" : "Resend verification email"}
          </LoadingButton>
        )}
      </AlertDescription>
    </Alert>
  );
}
