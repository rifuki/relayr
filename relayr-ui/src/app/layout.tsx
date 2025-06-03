// React and Next.js
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// External Libraries
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

// Providers
import ThemeProvider from "@/providers/ThemeProvider";
import TanStackProvider from "@/providers/TanStackProvider";

// Global Styles
import "./globals.css";

// Fonts configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "Relayr",
  description:
    "A fast and secure file transfer app powered by WebSocket technology.",
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanStackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TanStackProvider>
        <Toaster /> {/* Toaster component for notifications */}
        <SpeedInsights />
        {/* Vercel Speed Insights for performance monitoring */}
      </body>
    </html>
  );
}
