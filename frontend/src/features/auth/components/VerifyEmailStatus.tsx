"use client";

import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/common/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/axios";
import { useAuth } from "@/providers/AuthProvider";
import { MissingTokenCard } from "./TokenStates";
import { ResendVerificationForm } from "./ResendVerificationForm";
import {
  resolveVerifyEmailFailure,
  useVerifyEmail,
} from "../hooks/useVerifyEmail";

/** Seconds the fresh-success state stays on screen before handing off to /login. */
const REDIRECT_SECONDS = 4;

/**
 * Consumes an email verification token from the link in the verification email.
 *
 * Verification concerns the address, not the session, so this page works signed
 * out too. Four outcomes are rendered distinctly, which is why the backend
 * separates them at all:
 *
 *   success         the address is now confirmed → hand off to /login
 *   already-verified the link was followed twice → say so, don't re-claim it
 *   expired         the 10-minute window closed → offer a fresh link
 *   invalid         the token is unreadable → offer a fresh link
 *
 * Nothing here ever marks a user verified locally: the flag only ever changes
 * because the API said so.
 */
export function VerifyEmailStatus({ token }: { token: string | null }) {
  const verifyEmail = useVerifyEmail();
  const { user } = useAuth();
  const router = useRouter();
  const hasRun = useRef(false);
  const { mutate } = verifyEmail;

  useEffect(() => {
    if (!token || hasRun.current) return;

    // Guards against React 19 StrictMode's double-invoked effects, which would
    // otherwise spend two attempts against the same single-use token.
    hasRun.current = true;
    mutate(token);
  }, [token, mutate]);

  const isVerified = verifyEmail.isSuccess;
  const alreadyVerified = verifyEmail.data?.alreadyVerified ?? false;
  const failure = verifyEmail.isError
    ? resolveVerifyEmailFailure(verifyEmail.error)
    : null;

  // Hand the visitor to /login once the address is confirmed. Only the fresh
  // success auto-advances: someone re-opening an old link has just been told
  // their address was already fine, and yanking them away mid-sentence would
  // hide the explanation they came for.
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (!isVerified || alreadyVerified) return;

    if (secondsLeft <= 0) {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((left) => left - 1), 1000);

    return () => clearTimeout(timer);
  }, [isVerified, alreadyVerified, secondsLeft, router]);

  if (!token) {
    return (
      <MissingTokenCard
        title="Verification link incomplete"
        description="This link is missing its verification token."
        actionHref="/verify-email"
        actionLabel="Request a new link"
      />
    );
  }

  if (verifyEmail.isPending || verifyEmail.isIdle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifying your email</CardTitle>
          <CardDescription>This will only take a moment.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 py-4">
          <Spinner className="text-primary size-6" />
          <p className="text-muted-foreground text-sm">
            Confirming your address…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (failure || alreadyVerified) {
    const isExpired = failure === "expired";

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {alreadyVerified
              ? "Already verified"
              : isExpired
                ? "This link has expired"
                : "This link didn't work"}
          </CardTitle>
          <CardDescription>
            {alreadyVerified
              ? "Nothing to do — this address was confirmed earlier."
              : isExpired
                ? "Verification links are valid for 10 minutes."
                : "Verification links can only be used once."}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <Alert variant={alreadyVerified ? "success" : "destructive"}>
            {alreadyVerified ? <BadgeCheckIcon /> : <CircleAlertIcon />}
            <AlertDescription>
              {alreadyVerified
                ? "You're all set. Sign in and your confirmed address will show on your profile."
                : getApiErrorMessage(
                    verifyEmail.error,
                    isExpired
                      ? "The verification link has expired."
                      : "The verification link is invalid.",
                  )}
            </AlertDescription>
          </Alert>

          <Button asChild className="w-full">
            <Link href="/login">
              Sign in
              <ArrowRightIcon />
            </Link>
          </Button>

          {alreadyVerified ? null : (
            <>
              <Separator />
              <ResendVerificationForm email={user?.email ?? null} />
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email verified</CardTitle>
        <CardDescription>
          {user?.email
            ? `${user.email} is confirmed.`
            : "Thanks — your address is confirmed."}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
            <CircleCheckIcon className="size-6" />
          </span>
          <p className="text-muted-foreground text-center text-sm">
            You&apos;re all set. Sign in to reach your profile.
          </p>
          <Badge variant="secondary" className="gap-1.5">
            <ClockIcon className="size-3" />
            Taking you to sign in in {secondsLeft}s
          </Badge>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">
            Sign in now
            <ArrowRightIcon />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
