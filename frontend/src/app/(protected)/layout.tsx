import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";

/**
 * Every route in this group requires a session. `ProtectedRoute` blocks render
 * until the bootstrap resolves, so nothing here ever flashes for a signed-out
 * visitor.
 */
export default function ProtectedGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
