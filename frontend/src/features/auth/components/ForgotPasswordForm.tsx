"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { getApiErrorMessage } from "@/lib/axios";
import { useForgotPassword } from "../hooks/useForgotPassword";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "../validations/auth.schema";

/**
 * Requests a reset link.
 *
 * The confirmation is deliberately identical whether or not the address exists,
 * matching the API's own behaviour so this form cannot be used to discover which
 * emails have accounts.
 */
export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await forgotPassword.mutateAsync(values);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to send the reset link."));
    }
  });

  if (forgotPassword.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If an account exists for{" "}
            <span className="text-foreground font-medium">
              {forgotPassword.variables?.email}
            </span>
            , we&apos;ve sent a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <Alert variant="success">
            <CircleCheckIcon />
            <AlertDescription>
              The link is valid for 15 minutes. Remember to check your spam
              folder.
            </AlertDescription>
          </Alert>

          <Button
            type="button"
            variant="outline"
            onClick={() => forgotPassword.reset()}
          >
            Use a different email
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            <Link
              href="/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to choose a new one.
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton type="submit" loading={forgotPassword.isPending}>
              {forgotPassword.isPending ? "Sending…" : "Send reset link"}
              {!forgotPassword.isPending ? <ArrowRightIcon /> : null}
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
