/**
 * Guards redirect targets before handing them to the router.
 *
 * Redirect destinations are stored in Redux and could in principle be
 * influenced by a crafted URL, so only same-origin absolute paths are allowed —
 * anything protocol-relative (`//evil.com`) or absolute falls back.
 */
export function safeInternalPath(
  path: string | null | undefined,
  fallback = "/profile",
): string {
  if (!path) return fallback;

  // Must be an absolute path on this origin, not a scheme or protocol-relative URL.
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;

  return path;
}
