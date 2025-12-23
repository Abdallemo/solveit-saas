import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import type { Metadata } from "next";
import { CookiesProvider } from "next-client-cookies/server";
import { Inter } from "next/font/google";
import "./globals.css";
import { env } from "@/env/server";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXTAUTH_URL),
  title: {
    default: "SolveIt - AI-Powered Student Task Job Board",
    template: "%s | SolveIt",
  },
  description:
    "The SaaS platform for peer-to-peer academic task collaboration. Connect with student mentors, solve real-world problems, and book expert sessions.",

  openGraph: {
    title: "SolveIt - Student Task & Mentoring Job Board",
    description:
      "The AI-powered marketplace for student tasks and mentoring. Solve problems, earn reputation, and grow.",
    url: env.NEXTAUTH_URL,
    siteName: "SolveIt",
    locale: "en_MY",
    type: "website",
    images: [
      {
        url: "/og-v1compressed.jpg",
        alt: "SolveIt - Peer-to-Peer Academic Solutions",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "SolveIt - Peer-to-Peer Academic Solutions",
    images: ["/og-v1compressed.jpg"],
    description:
      "The AI-powered marketplace for student tasks and mentoring. Solve problems, earn reputation, and grow.",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased `}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <CookiesProvider>{children}</CookiesProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
