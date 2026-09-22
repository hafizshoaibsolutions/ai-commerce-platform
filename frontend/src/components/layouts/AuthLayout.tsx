import {
  BadgeCheckIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { FadeIn } from "@/components/common/FadeIn";
import { NoticeBanner } from "@/components/common/NoticeBanner";

const highlights = [
  {
    icon: ShieldCheckIcon,
    title: "Secure by default",
    description: "Sessions rotate automatically and stay out of reach of scripts.",
  },
  {
    icon: SparklesIcon,
    title: "AI-assisted shopping",
    description: "Describe what you need and let the storefront do the searching.",
  },
  {
    icon: BadgeCheckIcon,
    title: "One account, everywhere",
    description: "Track orders, wishlists and payments from a single place.",
  },
];

/**
 * Split-screen shell for every signed-out page.
 *
 * The brand panel is decorative and hidden below `lg`, where the form takes the
 * full width — the marketing copy must never push the form off a small screen.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/3 size-96 rounded-full bg-primary/30 blur-3xl"
        />

        <Link
          href="/"
          className="relative flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-background/10 ring-1 ring-background/20">
            <ShoppingBagIcon className="size-4.5" />
          </span>
          AI Commerce
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Shopping that understands what you actually mean.
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-70 xl:text-base">
            Sign in to pick up where you left off — your cart, wishlist and
            orders are waiting.
          </p>

          <ul className="mt-10 space-y-6">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background/10 ring-1 ring-background/15">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm opacity-60">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs opacity-50">
          © {new Date().getFullYear()} AI Commerce. All rights reserved.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 text-base font-semibold tracking-tight lg:hidden"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBagIcon className="size-4" />
          </span>
          AI Commerce
        </Link>

        <FadeIn className="w-full max-w-md">
          <NoticeBanner />
          {children}
        </FadeIn>
      </main>
    </div>
  );
}
