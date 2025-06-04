"use client";

// React && Next.js
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// External Libraries
import { DotIcon } from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Internal Components
import ThemeToggle from "./ThemeToggle";

// State Management (Stores)
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

// Props interface for Header component
interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Relayr" }: HeaderProps) {
  const pathname = usePathname();

  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Determine which store to use based on the active page
  const isSenderPage = pathname.startsWith("/transfer/send");
  const isReceiverPage = pathname.startsWith("/transfer/receive");

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

  const webSocketReadyState = isSenderPage
    ? senderWebSocketReadyState
    : isReceiverPage
      ? receiverWebSocketReadyState
      : -1;

  const handleTooltipToggle = () => setTooltipOpen((open) => !open);
  console.log(isSenderUploading, isReceiverDownloading);

  return (
    <header className="border-b bg-background/5 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-6 sm:px-8 lg:px-10 max-w-screen-xl">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              {title}
            </span>
          </Link>

          <nav className="flex items-center space-x-2">
            {!isReceiverDownloading && (
              <Button variant="link" size="sm" asChild>
                {isSenderUploading ? (
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

            {!isSenderUploading && (
              <Button variant="link" size="sm" asChild>
                {isReceiverDownloading ? (
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
        </div>

        <div className="flex items-center space-x-5">
          {(isSenderPage || isReceiverPage) && (
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger
                onClick={handleTooltipToggle}
                onTouchStart={handleTooltipToggle}
                asChild
              >
                <Button
                  className="bg-transparent"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <span>
                    <DotIcon
                      size={16 * 4}
                      className={`
                    ${
                      webSocketReadyState === 1
                        ? "text-green-500"
                        : webSocketReadyState === 0
                          ? "text-yellow-500"
                          : webSocketReadyState === 2
                            ? "text-orange-500"
                            : "text-red-500"
                    } animate-pulse
                  `}
                    />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  WebSocket Status:{" "}
                  <span>
                    {webSocketReadyState === 0 && "Connecting"}
                    {webSocketReadyState === 1 && "Connected"}
                    {webSocketReadyState === 2 && "Closing"}
                    {webSocketReadyState === 3 && "Disconnected"}
                    {![0, 1, 2, 3].includes(webSocketReadyState) &&
                      "Unknown status"}
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
