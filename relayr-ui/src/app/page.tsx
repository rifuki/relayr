// Next.js
import Link from "next/link";

// External Libraries
import {
  ArrowRightIcon,
  CloudLightningIcon,
  LockIcon,
  UserPlusIcon,
} from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div
      className="container mx-auto max-w-screen-lg flex flex-col items-center justify-center px-4 md:px-6 py-8"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div className="flex flex-col items-center space-y-15 text-center">
        {/* Title and Description */}
        <div className="space-y-7">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Relayr – Instant, Effortless File Transfer
          </h1>
          <p className="text-base sm:tx-lg text-muted-foreground font-medium max-w-md mx-auto">
            Share files instantly—no accounts, no hassle. Powered by Axum (Rust)
            for unmatched speed and privacy.
          </p>
        </div>
        {/* Title and Description End */}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-5">
          <Link href="/transfer/send">
            <Button
              className="w-full sm:w-auto rounded-lg p-6 font-semibold cursor-pointer"
              size="lg"
            >
              Send a File
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/transfer/receive">
            <Button
              className="w-full sm:w-auto rounded-lg p-6 font-semibold bg-transparent hover:bg-black/5 dark:bg-background/50 cursor-pointer"
              size="lg"
              variant="outline"
            >
              Receive a File
            </Button>
          </Link>
        </div>
        {/* Action Buttons End */}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 mt-8 cursor-default">
          <div className="p-6 rounded-lg shadow-sm bg-background/50 space-y-4">
            <div className="w-11 h-11 rounded-lg bg-secondary/90 flex items-center justify-center">
              <CloudLightningIcon className="w-5 h-5" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-lg font-semibold">Real-Time Transfer</h3>
              <p className="text-sm text-muted-foreground">
                Experience instant file transfers with WebSocket technology
              </p>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm bg-background/50 space-y-4">
            <div className="w-11 h-11 rounded-lg bg-secondary/90 flex items-center justify-center">
              <LockIcon className="w-5 h-5" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-lg font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                All files are end-to-end encrypted, with zero storage or traces
                left on our servers.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm bg-background/50 space-y-4">
            <div className="w-11 h-11 rounded-lg bg-secondary/90 flex items-center justify-center">
              <UserPlusIcon className="w-5 h-5" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-lg font-semibold">No Sign Up, No Hasle</h3>
              <p className="text-sm text-muted-foreground">
                Start transferring files instantly—no account, no registration,
                just seamless sharing.
              </p>
            </div>
          </div>
        </div>
        {/* Features Section */}
      </div>
    </div>
  );
}
