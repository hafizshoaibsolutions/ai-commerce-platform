"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { getApiErrorMessage } from "@/lib/axios";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginSchema } from "../validations/auth.schema";

/**
 * Sign-in form.
 *
 * On success it deliberately does not navigate: `GuestRoute` owns that once the
 * session flips, so the destination logic lives in one place.
 */
export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const login = useLogin();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login.mutateAsync(values);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to sign you in."));
      // Never leave a stale password sitting in a failed form.
      form.setValue("password", "", { shouldDirty: false });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your account.</CardDescription>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton type="submit" loading={login.isPending}>
              {login.isPending ? "Signing in…" : "Sign in"}
              {!login.isPending ? <ArrowRightIcon /> : null}
            </LoadingButton>

            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
