import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";

import { Spinner } from "@/components/common/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shown when a link arrives without its token — a truncated email, or someone
 * typing the URL by hand.
 */
export function MissingTokenCard({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>
            This link is missing its token. Open the most recent email we sent
            and follow the link inside it directly.
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Placeholder while `useSearchParams` resolves inside its Suspense boundary. */
export function TokenPendingCard({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <Spinner className="text-primary size-6" />
        <p className="text-muted-foreground text-sm">{label}</p>
      </CardContent>
    </Card>
  );
}
