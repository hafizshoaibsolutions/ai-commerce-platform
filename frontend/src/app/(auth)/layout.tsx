import type { ReactNode } from "react";

import { AuthLayout } from "@/components/layouts/AuthLayout";

/**
 * Shell for every signed-out route: /login, /register, /forgot-password,
 * /reset-password and /verify-email.
 */
export default function AuthGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
