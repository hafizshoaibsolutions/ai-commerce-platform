import type { Metadata } from "next";

import { VerifyEmailStatus } from "@/features/auth/components/VerifyEmailStatus";

export const metadata: Metadata = {
  title: "Verify email · AI Commerce",
  description: "Confirm your email address.",
};

/** Path-segment form of the verification link: `/verify-email/<token>`. */
export default async function VerifyEmailTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <VerifyEmailStatus token={token || null} />;
}
