"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, CircleCheckIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useResendVerification } from "../hooks/useResendVerification";
import {
  resendVerificationSchema,
  type ResendVerificationSchema,
} from "../validations/auth.schema";

/**
 * Requests a replacement verification link.
 *
 * The address is prefilled with the one registration used, since that is the
 * only address the visitor can plausibly want — but it stays editable so the
 * form still works when the page is reached without one (a reload, a bookmark,
 * or someone who registered with a different spelling).
 *
 * The success copy is deliberately conditional: the API answers 200 for
 * unknown addresses too, so asserting "we sent it" would be a claim the
 * frontend cannot make.
 */
export function ResendVerificationForm({ email }: { email: string | null }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const resend = useResendVerification();

  const form = useForm<ResendVerificationSchema>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: email ?? "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setSentTo(null);

    try {
      await resend.mutateAsync(values);
      setSentTo(values.email);
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, "Unable to send a new link. Try again."),
      );
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        {formError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        {sentTo ? (
          <Alert variant="success">
            <CircleCheckIcon />
            <AlertDescription>
              If <span className="font-medium">{sentTo}</span> still needs
              verifying, a new link is on its way. It expires in 10 minutes.
            </AlertDescription>
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

        <LoadingButton
          type="submit"
          variant="outline"
          loading={resend.isPending}
          className="w-full sm:w-auto"
        >
          <MailIcon />
          {resend.isPending ? "Sending…" : "Resend verification email"}
        </LoadingButton>
      </form>
    </Form>
  );
}
