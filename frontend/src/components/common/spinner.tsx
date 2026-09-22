import { LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Standalone spinner. shadcn has no spinner in the registry — its components
 * use a spinning lucide icon inline instead — so this only exists for the two
 * places that need a spinner without a Button around it.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircleIcon
      role="status"
      aria-label="Loading"
      className={cn("text-muted-foreground size-4 animate-spin", className)}
    />
  );
}

/** Full-viewport loader used while the session bootstrap runs. */
export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3">
      <Spinner className="text-primary size-6" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
