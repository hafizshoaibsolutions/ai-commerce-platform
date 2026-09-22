"use client";

import * as React from "react";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * shadcn's `Button` plus a `loading` state.
 *
 * The registry Button has no loading prop by design, so this is an extension
 * rather than a replacement: every variant, size and `asChild` behaviour still
 * comes from `buttonVariants`. It saves repeating the disabled + spinner +
 * aria-busy trio at ~10 call sites.
 */
function LoadingButton({
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircleIcon className="animate-spin" /> : null}
      {children}
    </Button>
  );
}

export { LoadingButton };
