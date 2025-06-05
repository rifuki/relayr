"use client";

// React && Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

// Internal Components
import ThemeToggle from "./ThemeToggle";
import WebSocketStatusButton from "./file-transfer/WebSocketStatusButton";

// State Management (Stores)
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

// Props interface for Header component
interface HeaderProps {
  title?: string;
}

/**
 * Header component for the Relayr application.
 * Displays the application title, navigation links,
 * WebSocket status, and theme toggle.
 *
 * @param {HeaderProps} props - The properties for the Header component.
 * @return JSX.Element The rendered Header component.
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

  // Determine which WebSocket state to show based on the current page
  const webSocketReadyState = isSenderPage
    ? senderWebSocketReadyState
    : isReceiverPage
      ? receiverWebSocketReadyState
      : -1;

  return (
    <header className="border-b bg-background/5 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8 lg:px-10 max-w-screen-xl">
        {/* Left side: App title and navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              {title}
            </span>
          </Link>
          {/* Navigation buttons: Send and Receive */}
          <nav className="flex items-center space-x-2">
            {[
              {
                label: "Send",
                href: "/transfer/send",
                isActive: isSenderPage,
                isDisabled: isReceiverDownloading,
                isBusy: isSenderUploading,
              },
              {
                label: "Receive",
                href: "/transfer/receive",
                isActive: isReceiverPage,
                isDisabled: isSenderUploading,
                isBusy: isReceiverDownloading,
              },
            ].map(
              (nav) =>
                !nav.isDisabled && (
                  <Button
                    key={nav.label}
                    asChild
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
                  >
                    {nav.isBusy ? (
                      <span
                        className="cursor-pointer"
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
        </div>
        {/* Left side: App title and navigation end */}

        {/* Right side: WebSocket status and theme toggle */}
        <div className="flex items-center space-x-5">
          {/* Show WebSocket indicator only on transfer pages */}
          {(isSenderPage || isReceiverPage) && (
            <WebSocketStatusButton readyState={webSocketReadyState} />
          )}

          {/* Toggle between light and dark theme */}
          <ThemeToggle />
        </div>
        {/* Right side: WebSocket status and theme toggle end */}
      </div>
    </header>
  );
}
