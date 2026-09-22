/**
 * React Query keys for the auth feature. Kept in one place so the provider and
 * the mutation hooks invalidate exactly the same entries.
 */
export const authKeys = {
  all: ["auth"] as const,
  me: ["auth", "me"] as const,
};
