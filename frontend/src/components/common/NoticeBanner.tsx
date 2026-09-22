"use client";

import { CircleAlertIcon, CircleCheckIcon, XIcon } from "lucide-react";

import { FadeIn } from "@/components/common/FadeIn";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearNotice } from "@/store/slices/ui.slice";

/**
 * One-shot banner for messages that need to survive a redirect — currently the
 * "verify your email" prompt after registration. The text lives in Redux
 * precisely because it must outlive the page that set it.
 */
export function NoticeBanner() {
  const notice = useAppSelector((state) => state.ui.notice);
  const dispatch = useAppDispatch();

  if (!notice) return null;

  const isDestructive = notice.variant === "destructive";

  return (
    <FadeIn className="mb-6">
      <Alert variant={notice.variant}>
        {isDestructive ? <CircleAlertIcon /> : <CircleCheckIcon />}
        <AlertDescription className="flex items-start justify-between gap-3">
          <span className="leading-relaxed">{notice.message}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => dispatch(clearNotice())}
            aria-label="Dismiss message"
            className="-mt-1 -mr-2 size-6 shrink-0"
          >
            <XIcon />
          </Button>
        </AlertDescription>
      </Alert>
    </FadeIn>
  );
}
