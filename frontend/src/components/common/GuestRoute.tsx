"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { FullPageSpinner } from "@/components/common/spinner";
import { safeInternalPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearRedirectTo } from "@/store/slices/ui.slice";

/**
 * Inverse of ProtectedRoute: for /login and /register only.
 *
 * Doubles as the post-authentication navigator. Once the session exists it
 * sends the user to wherever ProtectedRoute recorded, or to their profile.
 * Doing it here means the forms themselves never need redirect logic.
 *
 * Deliberately not applied to forgot/reset/verify pages: someone who is already
 * signed in may still legitimately need to reset a forgotten password.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const redirectTo = useAppSelector((state) => state.ui.redirectTo);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasRedirected.current) return;

    hasRedirected.current = true;
    router.replace(safeInternalPath(redirectTo));
    dispatch(clearRedirectTo());
  }, [isLoading, isAuthenticated, redirectTo, router, dispatch]);

  if (isLoading) {
    return <FullPageSpinner label="Checking your session…" />;
  }

  if (isAuthenticated) {
    return <FullPageSpinner label="Taking you to your account…" />;
  }

  return <>{children}</>;
}
