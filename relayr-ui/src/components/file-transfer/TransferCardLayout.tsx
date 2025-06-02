// React
import { ReactNode } from "react";

// External Libraries
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // ShadCN UI Components
import { motion } from "motion/react";
import { ReadyState } from "react-use-websocket";

// Custom UI Components
import AlertError from "@/components/AlertError";
import WebSocketStatus from "@/components/WebSocketStatus";

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
//
interface TransferCardLayoutProps {
  readyState: ReadyState;
  errorMessage: string | null;
  idLabel: string;
  connectionId: string | null;
  children: ReactNode;
}

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
            <WebSocketStatus readyState={readyState} />
          </MotionCardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-5">
          {errorMessage && <AlertError message={errorMessage} />}
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
