// React
import { ReactNode } from "react";

// ShadCN UI Components
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Custom UI Components
import { ReadyState } from "react-use-websocket";
import { TransferAlertError, TransferConnectionStatus } from "./shared";

// Motion Components
// const MotionCard = motion.create(Card);

// Motion Variants for Animations
// const cardVariants = {
//   hidden: {
//     opacity: 0,
//     y: 50,
//     scale: 1,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       type: "spring",
//       stiffness: 300,
//       damping: 30,
//       duration: 1,
//     },
//   },
// };

// Props interface for TransferCardLayout component
interface TransferCardLayoutProps {
  readyState: ReadyState; // WebSocket ready state for connection status display
  errorMessage: string | null; // Error message to show alert if present
  connectionId: string | null; // Unique connection ID to display in UI
  children: ReactNode; // Child components/content to render inside the card
}

/**
 * TransferCardLayout Component
 * A layout component for file transfer operations, displaying connection status and error messages.
 *
 * @param {TransferCardLayoutProps} props - The properties for the component.
 * @returns JSX.Element The rendered component.
 */
export default function TransferCardLayout({
  readyState,
  errorMessage,
  connectionId,
  children,
}: TransferCardLayoutProps) {
  return (
    <>
      <Card className="w-screen max-w-sm sm:max-w-md overflow-hidden bg-opacity border-none shadow-none">
        <CardContent className="flex flex-col space-y-5">
          {errorMessage && <TransferAlertError message={errorMessage} />}
          {children}
        </CardContent>

        <CardFooter className="mx-auto flex flex-col">
          <TransferConnectionStatus readyState={readyState} />
          {readyState === ReadyState.OPEN && connectionId && (
            <div className="text-sm text-muted-foreground mt-2">
              ID: <strong>{connectionId}</strong>
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
