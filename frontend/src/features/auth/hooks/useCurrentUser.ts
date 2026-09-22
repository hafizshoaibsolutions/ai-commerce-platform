"use client";

import { useAuth } from "@/providers/AuthProvider";

/**
 * Accessor for the signed-in user.
 *
 * Unlike a per-hook query, the profile is fetched once by the AuthProvider and
 * shared through context, so calling this in many components costs no extra
 * requests and every consumer sees the same object.
 */
export function useCurrentUser() {
  const { user, status, isAuthenticated, isLoading, isAdmin, hasRole } =
    useAuth();

  return { user, status, isAuthenticated, isLoading, isAdmin, hasRole };
}
