import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import type { Metadata } from "next";
import { CookiesProvider } from "next-client-cookies/server";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolveIt",
  description: "A SaaS based Student Job Board",
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
