import type { Metadata } from "next";

import { GuestRoute } from "@/components/common/GuestRoute";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in · AI Commerce",
  description: "Sign in to your AI Commerce account.",
};

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  );
}
