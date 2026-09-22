import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password · AI Commerce",
  description: "Request a link to reset your AI Commerce password.",
};

/**
 * Intentionally not wrapped in `GuestRoute`: a signed-in user may still need to
 * reset a password they have forgotten.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
