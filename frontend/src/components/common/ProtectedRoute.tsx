"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { FullPageSpinner } from "@/components/common/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { useAppDispatch } from "@/store/hooks";
import { setRedirectTo } from "@/store/slices/ui.slice";

/**
 * Wraps routes that require a signed-in user.
 *
 * Nothing renders until the session bootstrap finishes, which is what prevents
 * the classic flash-of-redirect: on a hard reload the access token is still
 * being exchanged, and treating that moment as "signed out" would bounce an
 * authenticated user to /login.
 *
 * The intended destination is remembered in Redux so sign-in can return there.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading || isAuthenticated || hasRedirected.current) return;

    hasRedirected.current = true;
    dispatch(setRedirectTo(pathname));
    router.replace("/login");
  }, [isLoading, isAuthenticated, pathname, router, dispatch]);

  if (isLoading) {
    return <FullPageSpinner label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return <FullPageSpinner label="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}
