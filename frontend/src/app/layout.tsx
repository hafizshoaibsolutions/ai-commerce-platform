import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ReactQueryProvider from "@/providers/ReactQueryProvider";
import StoreProvider from "@/providers/StoreProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Commerce",
  description:
    "Shopping that understands what you actually mean — sign in to pick up where you left off.",
};

/**
 * Applies shadcn's class-based dark mode from the OS preference before first
 * paint, then keeps it in sync. Inlined and blocking on purpose: running it
 * after paint would flash the light theme at dark-mode users.
 *
 * Deliberately not `next-themes` — that would be a dependency and a provider
 * just to add a class, and there is no theme toggle yet. Swap it in when one is
 * needed.
 */
const themeScript = `(function(){var m=window.matchMedia('(prefers-color-scheme: dark)');function a(){document.documentElement.classList.toggle('dark',m.matches)}a();m.addEventListener('change',a)})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The inline script below sets `class` before React hydrates.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <StoreProvider>
          <ReactQueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </ReactQueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
