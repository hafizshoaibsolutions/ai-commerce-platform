import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { MissingTokenCard } from "@/features/auth/components/TokenStates";

export const metadata: Metadata = {
  title: "Reset password · AI Commerce",
  description: "Choose a new password for your AI Commerce account.",
};

/** Path-segment form of the reset link: `/reset-password/<token>`. */
export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

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
