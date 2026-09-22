"use client";

import { ArrowRightIcon, MailCheckIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResendVerificationForm } from "./ResendVerificationForm";

const steps = [
  "Open the email we just sent you.",
  "Follow the link inside to confirm your address.",
  "Sign in — you'll land straight on your profile.",
];

/**
 * Landing page after registration: the account exists, the address does not.
 *
 * It is deliberately reachable without a session (see `useRegister`, which
 * revokes the one the API issues) — there is nothing to protect here yet, and
 * the visitor may well open this page in a different tab from the one they
 * registered in.
 *
 * The copy stops short of saying the account is locked: the API accepts a
 * sign-in from an unverified account, so claiming otherwise would be a lie. The
 * unverified badge on /profile is what keeps the address outstanding.
 */
export function CheckEmailCard({ email }: { email: string | null }) {
  return (
    <Card>
      <CardHeader>
        <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
          <MailCheckIcon className="size-5" />
        </span>

        <CardTitle className="mt-4 text-2xl">Check your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a verification link to{" "}
              <span className="text-foreground font-medium break-all">
                {email}
              </span>
              .
            </>
          ) : (
            "We sent you a verification link."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        <ol className="text-muted-foreground grid gap-2.5 text-sm">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="bg-muted text-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        <p className="text-muted-foreground text-sm leading-relaxed">
          The link expires in 10 minutes. If it doesn&apos;t arrive, check your
          spam folder before requesting another.
        </p>

        <Separator />

        <ResendVerificationForm email={email} />

        <Button asChild variant="ghost" className="w-full">
          <Link href="/login">
            Back to sign in
            <ArrowRightIcon />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
