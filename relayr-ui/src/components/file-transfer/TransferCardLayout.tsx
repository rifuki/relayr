// React
import { ReactNode } from "react";

// External Libraries
import { motion } from "motion/react";

// ShadCN UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Custom UI Components
import { ReadyState } from "react-use-websocket";
import { TransferAlertError, TransferConnectionStatus } from "./shared";

// Motion Components
const MotionCardTitle = motion.create(CardTitle);
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
  idLabel: string; // Label for the connection ID display (e.g., "Receiver", "Sender")
  connectionId: string | null; // Unique connection ID to display in UI
  children: ReactNode; // Child components/content to render inside the card
}

/**
 * TransferCardLayout component renders a card layout for file transfer operations.
 * It displays the connection status, any error messages, and the connection ID.
 * The card contains a header with the connection status and a content area for children components.
 *
 * @param {TransferCardLayoutProps} props - Component props containing WebSocket state, error message, IDs, and children.
 * @returns JSX.Element - A card UI element with connection status and content area.
 */
export default function TransferCardLayout({
  readyState,
  errorMessage,
  idLabel,
  connectionId,
  children,
}: TransferCardLayoutProps) {
  return (
    <>
      <Card className="w-screen max-w-sm sm:max-w-md overflow-hidden">
        <CardHeader>
          <MotionCardTitle>
            <TransferConnectionStatus readyState={readyState} />
          </MotionCardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-5">
          {errorMessage && <TransferAlertError message={errorMessage} />}
          {children}
        </CardContent>
      </Card>

      {connectionId && (
        <div className="fixed bottom-5 right-5 dark:text-white">
          <strong>{idLabel} ID: </strong> {connectionId}
        </div>
      )}
    </>
  );
}
