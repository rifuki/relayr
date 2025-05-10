"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebSocketStatus from "@/components/WebSocketStatus";
import SendFlow from "@/components/file-transfer/sender/SendFlow";
import AlertError from "@/components/AlertError";
import { useFileSenderSocket } from "@/hooks/useFileSenderSocket";
import { useFileSenderStore } from "@/stores/useFileSenderStore";

export default function SendPage() {
  const { readyState } = useFileSenderSocket();
  const errorMessage = useFileSenderStore((state) => state.errorMessage);
  const isTransferring = useFileSenderStore(
    (state) => state.transferStatus.isTransferring,
  );

  //const cardContentVariants = {
  //  hidden: {
  //    opacity: 0,
  //    y: 50,
  //    scale: 1,
  //  },
  //  visible: {
  //    opacity: 1,
  //    y: 0,
  //    scale: 1,
  //    transition: {
  //      type: "spring",
  //      stiffness: 300,
  //      damping: 30,
  //      duration: 1,
  //    },
  //  },
  //};

  //const MotionCard = motion.create(Card);
  const MotionCardTitle = motion.create(CardTitle);

  return (
    <Card className="w-screen max-w-sm sm:max-w-md overflow-hidden">
      <CardHeader>
        {isTransferring ? (
          <CardTitle>
            <WebSocketStatus readyState={readyState} />
          </CardTitle>
        ) : (
          <MotionCardTitle>
            <WebSocketStatus readyState={readyState} />
          </MotionCardTitle>
        )}
      </CardHeader>
      <CardContent className="flex flex-col space-y-5">
        {errorMessage && <AlertError message={errorMessage} />}
        <SendFlow />
      </CardContent>
    </Card>
  );
}
