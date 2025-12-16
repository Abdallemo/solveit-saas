import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import type { Metadata } from "next";
import { CookiesProvider } from "next-client-cookies/server";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://solveit.up.railway.app"),
  title: {
    default: "SolveIt - AI-Powered Student Task Board",
    template: "%s | SolveIt",
  },
  description:
    "The SaaS platform for peer-to-peer academic task collaboration. Connect with student mentors, solve real-world problems, and book expert sessions.",

  openGraph: {
    title: "SolveIt - Student Task & Mentoring Board",
    description:
      "Don't just find a job—solve a problem. Join the peer-to-peer platform for academic collaboration and expert mentoring.",
    url: "https://solveit.up.railway.app",
    siteName: "SolveIt",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SolveIt - Peer-to-Peer Academic Solutions",
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
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CookiesProvider>{children}</CookiesProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
