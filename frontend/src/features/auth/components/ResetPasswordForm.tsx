"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CircleAlertIcon, CircleCheckIcon, KeyRoundIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { getApiErrorMessage } from "@/lib/axios";
import { useResetPassword } from "../hooks/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "../validations/auth.schema";

/**
 * Sets a new password from a reset token.
 *
 * On success the API revokes every refresh token for the account, so this
 * session is finished too. `useResetPassword` clears local auth state and leaves
 * a notice in Redux, and we send the user to /login to start again.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const resetPassword = useResetPassword();
  const router = useRouter();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!resetPassword.isSuccess) return;

    const timeout = setTimeout(() => router.replace("/login"), 1500);

    return () => clearTimeout(timeout);
  }, [resetPassword.isSuccess, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await resetPassword.mutateAsync({
        token,
        password: values.password,
      });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to reset your password."));
    }
  });

  if (resetPassword.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password updated</CardTitle>
          <CardDescription>
            You can now sign in with your new password. Taking you there…
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <Alert variant="success">
            <CircleCheckIcon />
            <AlertDescription>
              For your security, all other sessions have been signed out.
            </AlertDescription>
          </Alert>

          <LoadingButton loading className="w-full">
            Redirecting to sign in…
          </LoadingButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          Pick something you haven&apos;t used here before.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-5" noValidate>
            {formError ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="••••••••"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>At least 8 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton type="submit" loading={resetPassword.isPending}>
              {resetPassword.isPending ? "Updating…" : "Update password"}
              {!resetPassword.isPending ? <KeyRoundIcon /> : null}
            </LoadingButton>

            <p className="text-muted-foreground text-center text-sm">
              <Link
                href="/login"
                className="text-primary inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
              >
                <ArrowLeftIcon className="size-3.5" />
                Back to sign in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
