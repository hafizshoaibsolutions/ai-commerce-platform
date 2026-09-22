"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { getApiErrorMessage } from "@/lib/axios";
import { useRegister } from "../hooks/useRegister";
import { registerSchema, type RegisterSchema } from "../validations/auth.schema";

/**
 * Account creation form.
 *
 * `confirmPassword` exists only in the client schema — it is stripped before the
 * request, because the API's register body is `{ name, email, password }`.
 *
 * On success the visitor is sent to /verify-email rather than signed in. The
 * account exists but the address doesn't, and the next step belongs to them:
 * open the email, follow the link, then sign in. `replace` is used so the back
 * button can't return to a form whose account has already been created.
 */
export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const register = useRegister();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      const result = await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setIsRedirecting(true);
      // Held until the router lands, so the button can't flash back to idle.
      router.replace(
        `/verify-email?email=${encodeURIComponent(result.user.email)}`,
      );
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create your account."));
      form.setValue("password", "", { shouldDirty: false });
      form.setValue("confirmPassword", "", { shouldDirty: false });
    }
  });

  const isBusy = register.isPending || isRedirecting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          It takes less than a minute — no card required.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="••••••••"
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
                  <FormLabel>Confirm password</FormLabel>
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

            <LoadingButton type="submit" loading={isBusy}>
              {isBusy ? "Creating account…" : "Create account"}
              {!isBusy ? <ArrowRightIcon /> : null}
            </LoadingButton>

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
