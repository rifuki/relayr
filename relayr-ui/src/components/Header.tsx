"use client";

// Next.js
import Link from "next/link";

// ShadCN UI Components
import { Button } from "./ui/button";

// Internal Components
import ThemeToggle from "./ThemeToggle";
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { DotIcon } from "lucide-react";
import { Card } from "./ui/card";

// Props interface for Header component
interface HeaderProps {
  title?: string;
}

/**
 * Header component renders the top navigation bar with the app title,
 * navigation buttons, and a theme toggle switch.
 *
 * @param {HeaderProps} props - Component props containing the title.
 * @returns JSX.Element - A header element with navigation and theme toggle.
 */
export default function Header({ title = "Relayr" }: HeaderProps) {
  const { isTransferring: isSenderUploading } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  const { isTransferring: isReceiverDownloading } = useFileReceiverStore(
    (state) => state.transferStatus,
  );

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
              <Button variant="link" size="sm">
                <Link href="/transfer/send">Send</Link>
              </Button>
            )}
            {!isSenderUploading && (
              <Button variant="link" size="sm">
                <Link href="/transfer/receive">Receive</Link>
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-transparent"
                asChild
              >
                <DotIcon className="h-8 w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>WebSocket Status: Disconnected</TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
