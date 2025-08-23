import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans, } from "geist/font/sans";
import { SessionProvider, useSession } from "next-auth/react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
    <SessionProvider >
      <html lang="en" suppressHydrationWarning >
        <body
          className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
            <Toaster position="top-center" richColors/>
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
