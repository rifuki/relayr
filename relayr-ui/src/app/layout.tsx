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
import SenderWebSocketProvider from "@/providers/SenderWebSocketProvider";
import ReceiverWebSocketProvider from "@/providers/ReceiverWebSocketProvider";

import ThemeProvider from "@/providers/ThemeProvider";
import TanStackProvider from "@/providers/TanStackProvider";

// Listeners
import ConnectionStatusListener from "@/listeners/ConnectionStatusListener";
import SenderWebSocketListener from "@/listeners/websocket/SenderWebSocketListener";
import ReceiverWebSocketListener from "@/listeners/websocket/ReceiverWebSocketListener";

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
    "A fast, simple, and direct file transfer app powered by WebSocket technology. Instantly send files between devices with ease.",
  keywords: [
    "file-transfer",
    "websocket",
    "fast",
    "simple",
    "relayr",
    "direct",
  ],
  openGraph: {
    title: "Relayr",
    description:
      "A fast, simple, and direct file transfer app powered by WebSocket technology. Instantly send files between devices with ease.",
    url: "https://relayr.rifuki.dev",
    siteName: "Relayr",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
          <SenderWebSocketListener />
          <ReceiverWebSocketProvider>
            <ReceiverWebSocketListener />
            <ConnectionStatusListener />
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
          </ReceiverWebSocketProvider>
        </SenderWebSocketProvider>
        {/* Sonner for toast notifications */}
        <Toaster />
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
