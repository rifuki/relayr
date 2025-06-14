"use client";

// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// External Libraries
import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

// Custom Components
import { HeaderConnectionStatus } from "./file-transfer/commons";

// Internal Components
import ThemeToggle from "./ThemeToggle";

// Context Providers
import { useSenderWebSocket } from "@/providers/SenderWebSocketProvider";
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

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

function getCombinedReadyState(sender: number, receiver: number): number {
  if (sender === 1 || receiver === 1) return 1;
  if (sender === 0 || receiver === 0) return 0;
  if (sender === 2 || receiver === 2) return 2;
  if (sender === 3 || receiver === 3) return 3;
  return -1; // Default case if no valid state is found
}

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
  const senderWebSocket = useSenderWebSocket();
  const { readyState: senderWebSocketReadyState } = senderWebSocket ?? {
    readyState: -1,
  };
  const receiverWebSocket = useReceiverWebSocket();
  const { readyState: receiverWebSocketReadyState } = receiverWebSocket ?? {
    readyState: -1,
  };

  const {
    isTransferring: isSenderUploading,
    isTransferCompleted: isSenderTransferCompleted,
  } = useFileSenderStore((state) => state.transferStatus);
  const {
    isTransferring: isReceiverDownloading,
    isTransferCompleted: isReceiverTransferCompleted,
  } = useFileReceiverStore((state) => state.transferStatus);

  // Navigation state logic
  const navState = [
    {
      ...NAV_LINKS[0],
      isActive: isSenderPage,
      isTransferring: isSenderUploading,
      isCompleted: isSenderTransferCompleted,
    },
    {
      ...NAV_LINKS[1],
      isActive: isReceiverPage,
      isTransferring: isReceiverDownloading,
      isCompleted: isReceiverTransferCompleted,
    },
  ];

  const webSocketReadyState = getCombinedReadyState(
    senderWebSocketReadyState,
    receiverWebSocketReadyState,
  );

  const isTransferCompleted =
    isSenderTransferCompleted && isReceiverTransferCompleted;

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
          className={`flex items-center ${isTransferCompleted ? "gap-2" : "gap-4"} sm:gap-5`}
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
          <nav className="flex items-center gap-1 sm:gap-2">
            {navState.map((nav) => (
              <Button
                key={nav.label}
                variant="ghost"
                size="sm"
                className={`relative px-3 py-1.5 rounded-md font-medium transition-colors
                    ${
                      nav.isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }
                  `}
                aria-current={nav.isActive ? "page" : undefined}
                asChild
              >
                <span className="flex items-center gap-1.5">
                  {nav.label}
                  {nav.isCompleted ? (
                    <span
                      className="ml-1 inline-block h-4 w-4 rounded-full text-green-500"
                      title="Transfer Completed"
                    >
                      <CheckIcon />
                    </span>
                  ) : (
                    nav.isTransferring && (
                      <span className="ml-1 inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )
                  )}

                  <Link
                    href={nav.href}
                    className="absolute inset-0"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </span>
              </Button>
            ))}
          </nav>
          {/* Navigation buttons: Send and Receive end */}
        </motion.div>
        {/* Left side: App title and navigation end */}

        {/* Right side: WebSocket status and theme toggle */}
        <motion.div
          className={`flex items-center ${isTransferCompleted ? "gap-1.5" : "gap-4"} sm:gap-4`}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <HeaderConnectionStatus readyState={webSocketReadyState} />

          {/* Toggle between light and dark theme */}
          <ThemeToggle />
        </motion.div>
        {/* Right side: WebSocket status and theme toggle end */}
      </div>
    </motion.header>
  );
}
