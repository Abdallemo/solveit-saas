import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { CookiesProvider } from "next-client-cookies/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolveIt",
  description: "A SaaS based Student Job Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={30 * 60}
      refetchOnWindowFocus={true}>
      <ReactQueryProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange>
              <CookiesProvider>{children}</CookiesProvider>
              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </body>
        </html>
      </ReactQueryProvider>
    </SessionProvider>
  );
}
