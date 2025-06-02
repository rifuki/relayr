"use client";

// External Libraries
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // ShadCN UI Components
import { motion } from "motion/react";

// File Transfer Components
import SenderFlow from "@/components/file-transfer/sender/SenderFlow";

// Custom UI Components
import AlertError from "@/components/AlertError";
import WebSocketStatus from "@/components/WebSocketStatus";

// Hooks
import { useFileSenderSocket } from "@/hooks/useFileSenderSocket";
import { useInitId } from "@/hooks/useInitId";

// State Management (Store)
import { useFileSenderStore } from "@/stores/useFileSenderStore";

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

export default function SendPage() {
  const id = useInitId("sender");

  const { readyState } = useFileSenderSocket();
  const errorMessage = useFileSenderStore((state) => state.errorMessage);

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
          <SenderFlow />
        </CardContent>
      </Card>

      {id && (
        <div className="fixed bottom-5 right-5 dark:text-white">
          <strong>Sender ID: </strong> {id}
        </div>
      )}
    </>
  );
}
