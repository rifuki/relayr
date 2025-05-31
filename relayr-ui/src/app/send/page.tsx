"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebSocketStatus from "@/components/WebSocketStatus";
import SendFlow from "@/components/file-transfer/sender/SendFlow";
import AlertError from "@/components/AlertError";
import { useFileSenderSocket } from "@/hooks/useFileSenderSocket";
import { useInitId } from "@/hooks/useInitId";
import { useFileSenderStore } from "@/stores/useFileSenderStore";

//const cardVariants = {
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

export default function SendPage() {
  const { readyState } = useFileSenderSocket();
  const errorMessage = useFileSenderStore((state) => state.errorMessage);
  const id = useInitId("sender");

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
          <SendFlow />
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
