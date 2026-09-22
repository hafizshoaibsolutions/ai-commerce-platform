"use client";

import { LogOutIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [{ href: "/profile", label: "Profile" }] as const;

/**
 * Signed-in shell: application header plus the page body.
 *
 * Rendered inside `ProtectedRoute`, so the profile is already loaded by the time
 * anything here paints. `navItems` is a list rather than a single link so the
 * storefront sections can slot in beside Profile.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const logout = useLogout();
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <ShoppingBagIcon className="size-4" />
            </span>
            AI Commerce
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <UserIcon />
                    {item.label}
                  </Link>
                </Button>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8">
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-sm font-medium">
                    {user?.name ?? "Your account"}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  disabled={logout.isPending}
                  onSelect={() => logout.mutate()}
                >
                  <LogOutIcon />
                  {logout.isPending ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
