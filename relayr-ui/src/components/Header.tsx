"use client";

// React && Next.js
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Internal Components
import ThemeToggle from "./ThemeToggle";
import WebSocketStatusIndicator from "./file-transfer/commons/WebSocketStatusIndicator";

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

  const [tooltipOpen, setTooltipOpen] = useState(false);

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

  // Toggle tooltip visibility
  const handleTooltipToggle = () => setTooltipOpen((open) => !open);

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
            {/* Show "Send" link only if receiver is not downloading */}
            {!isReceiverDownloading && (
              <Button variant="link" size="sm" asChild>
                {isSenderUploading ? (
                  // Prevent navigation if a transfer is in progress
                  <span
                    className="cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Send
                  </span>
                ) : (
                  <Link href="/transfer/send">Send</Link>
                )}
              </Button>
            )}

            {/* Show "Receive" link only if sender is not uploading */}
            {!isSenderUploading && (
              <Button variant="link" size="sm" asChild>
                {isReceiverDownloading ? (
                  // Prevent navigation if a transfer is in progress
                  <span
                    className="cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Receive
                  </span>
                ) : (
                  <Link href="/transfer/receive">Receive</Link>
                )}
              </Button>
            )}
          </nav>
          {/* Navigation buttons: Send and Receive */}
        </div>
        {/* Left side: App title and navigation end */}

        {/* Right side: WebSocket status and theme toggle */}
        <div className="flex items-center space-x-5">
          {/* Show WebSocket indicator only on transfer pages */}
          {(isSenderPage || isReceiverPage) && (
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger
                onClick={handleTooltipToggle}
                onTouchStart={handleTooltipToggle}
                asChild
              >
                <Button
                  className="bg-transparent h-8 w-8"
                  variant="outline"
                  size="icon"
                >
                  {/* WebSocket status icon (e.g. connected, connecting, closed) */}
                  <WebSocketStatusIndicator readyState={webSocketReadyState} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                WebSocket:{" "}
                <WebSocketStatusIndicator
                  readyState={webSocketReadyState}
                  showText // Show label like "Connected", "Closed", etc.
                />
              </TooltipContent>
            </Tooltip>
          )}
          {/* Toggle between light and dark theme */}
          <ThemeToggle />
        </div>
        {/* Right side: WebSocket status and theme toggle end */}
      </div>
    </header>
  );
}
