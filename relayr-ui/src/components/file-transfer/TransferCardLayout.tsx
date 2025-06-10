// React
import { ReactNode } from "react";

// External Libraries
import { motion } from "motion/react";

// ShadCN UI Components
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Custom UI Components
import { ReadyState } from "react-use-websocket";
import { TransferConnectionStatus, TransferErrorAlert } from "./shared";

// Props interface for TransferCardLayout component
interface TransferCardLayoutProps {
  readyState: ReadyState; // WebSocket ready state for connection status display
  errorMessage: string | null; // Error message to show alert if present
  connectionId: string | null; // Unique connection ID to display in UI
  showConnectionStatus?: boolean; // Optional prop to control connection status display
  children: ReactNode; // Child components/content to render inside the card
}

export default function TransferCardLayout({
  readyState,
  errorMessage,
  connectionId,
  showConnectionStatus = true,
  children,
}: TransferCardLayoutProps) {
  return (
    <Card className="w-screen max-w-sm sm:max-w-md overflow-hidden bg-opacity border-none shadow-none gap-5">
      <CardContent className="w-full flex flex-col gap-5">
        {errorMessage && <TransferErrorAlert message={errorMessage} />}
        {children}
      </CardContent>

      <CardFooter className="mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.8,
          }}
        >
          {showConnectionStatus && (
            <TransferConnectionStatus readyState={readyState} />
          )}
          {readyState === ReadyState.OPEN && connectionId && (
            <div className="text-sm text-muted-foreground mt-1">
              ID: <strong>{connectionId}</strong>
            </div>
          )}
        </motion.div>
      </CardFooter>
    </Card>
  );
}
