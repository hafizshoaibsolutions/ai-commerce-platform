import type { Metadata } from "next";

import { GuestRoute } from "@/components/common/GuestRoute";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create account · AI Commerce",
  description: "Create your AI Commerce account.",
};

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}
