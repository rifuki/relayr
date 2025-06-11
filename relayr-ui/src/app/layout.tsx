// React and Next.js
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// External Libraries
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

// Custom Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Providers
import { SenderWebSocketProvider } from "@/providers/SenderWebSocketProvider";
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
        <SenderWebSocketProvider>
          <TanStackProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="min-h-screen flex flex-col dark:bg-neutral-900">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </TanStackProvider>
          <Toaster />
        </SenderWebSocketProvider>
        {/* Sonner for toast notifications */}
        {process.env.NODE_ENV !== "development" && (
          <>
            <Analytics />
            {/* Vercel Analytics for tracking user interactions */}
            <SpeedInsights />
            {/* Vercel Speed Insights for performance monitoring */}
          </>
        )}
      </body>
    </html>
  );
}
