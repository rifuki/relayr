"use client";

// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// External Libraries
import { motion } from "motion/react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

// Internal Components
import HeaderWebSocketStatusButton from "./file-transfer/HeaderWebSocketStatusButton";
import ThemeToggle from "./ThemeToggle";

// State Management (Stores)
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

// Navigation config moved outside component for clarity and maintainability
const NAV_LINKS = [
  {
    label: "Send",
    href: "/transfer/send",
    key: "send",
  },
  {
    label: "Receive",
    href: "/transfer/receive",
    key: "receive",
  },
];

// Props interface for Header component
interface HeaderProps {
  title?: string;
}

/**
 * Header component for the Relayr application.
 * Displays the app title, navigation buttons for sending and receiving files,
 * WebSocket status, and a theme toggle button.
 *
 * @param {HeaderProps} props - The properties for the Header component.
 * @returns JSX.Element The rendered Header component.
 */
export default function Header({ title = "Relayr" }: HeaderProps) {
  const pathname = usePathname();

  // Determine whether the user is currently on the sender or receiver page
  const isSenderPage = pathname.startsWith("/transfer/send");
  const isReceiverPage = pathname.startsWith("/transfer/receive");

  // Get WebSocket status and transfer state from zustand stores
  const senderWebSocketReadyState = useFileSenderStore(
    (state) => state.webSocketReadyState,
  );
  const receiverWebSocketReadyState = useFileReceiverStore(
    (state) => state.webSocketReadyState,
  );
  const { isTransferring: isSenderUploading } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  const { isTransferring: isReceiverDownloading } = useFileReceiverStore(
    (state) => state.transferStatus,
  );

  // Navigation state logic
  const navState = [
    {
      ...NAV_LINKS[0],
      isActive: isSenderPage,
      isDisabled: isReceiverDownloading,
      isBusy: isSenderUploading,
    },
    {
      ...NAV_LINKS[1],
      isActive: isReceiverPage,
      isDisabled: isSenderUploading,
      isBusy: isReceiverDownloading,
    },
  ];

  // Determine which WebSocket state to show based on the current page
  const webSocketReadyState = isSenderPage
    ? senderWebSocketReadyState
    : isReceiverPage
      ? receiverWebSocketReadyState
      : -1;

  return (
    <motion.header
      className={`sticky top-0 z-10 border-b  ${pathname === "/" ? "bg-background/10" : "bg-background/50 sm:bg-background/10"} backdrop-blur-md`}
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8 lg:px-10 max-w-screen-xl">
        {/* Left side: App title and navigation */}
        <motion.div
          className="flex items-center space-x-6"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              {title}
            </span>
          </Link>
          {/* Navigation buttons: Send and Receive */}
          <nav className="flex items-center space-x-2">
            {navState.map(
              (nav) =>
                !nav.isDisabled && (
                  <Button
                    key={nav.label}
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors
                    ${
                      nav.isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }
                  `}
                    aria-current={nav.isActive ? "page" : undefined}
                    tabIndex={nav.isBusy ? -1 : 0}
                    disabled={nav.isBusy}
                    asChild
                  >
                    {nav.isBusy ? (
                      <span
                        className="cursor-not-allowed"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {nav.label}
                      </span>
                    ) : (
                      <Link href={nav.href}>{nav.label}</Link>
                    )}
                  </Button>
                ),
            )}
          </nav>
          {/* Navigation buttons: Send and Receive end */}
        </motion.div>
        {/* Left side: App title and navigation end */}

        {/* Right side: WebSocket status and theme toggle */}
        <motion.div
          className="flex items-center space-x-5"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Show WebSocket indicator only on transfer pages */}
          {(isSenderPage || isReceiverPage) && (
            <HeaderWebSocketStatusButton readyState={webSocketReadyState} />
          )}

          {/* Toggle between light and dark theme */}
          <ThemeToggle />
        </motion.div>
        {/* Right side: WebSocket status and theme toggle end */}
      </div>
    </motion.header>
  );
}
