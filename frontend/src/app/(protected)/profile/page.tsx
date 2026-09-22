import type { Metadata } from "next";

import { ProfileForm } from "@/features/auth/components/ProfileForm";

export const metadata: Metadata = {
  title: "Your profile · AI Commerce",
  description: "Manage your AI Commerce account details.",
};

export default function ProfilePage() {
  return <ProfileForm />;
}
