"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a show/hide toggle.
 *
 * Composed from shadcn's `Input` and `Button` — there is no password component
 * in the registry, so this is the documented way to extend one.
 *
 * Props are forwarded straight to the underlying `<Input>` because
 * `<FormControl>` renders a Radix `Slot`, which clones `id`, `aria-describedby`
 * and `aria-invalid` onto its direct child. If those stopped here they would
 * land on the wrapper `div` and the label would no longer point at the field.
 */
function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-0.5 size-8 -translate-y-1/2 hover:bg-transparent"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  );
}

export { PasswordInput };
