"use client";

// React and Nexts.js
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// External Libraries
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // ShadCN UI Components
import { motion } from "motion/react";

// File Transfer Components
import ReceiverFlow from "@/components/file-transfer/receiver/ReceiverFlow";

// Custom UI Components
import AlertError from "@/components/AlertError";
import WebSocketStatus from "@/components/WebSocketStatus";

// Hooks
import { UseFileReceiverSocket } from "@/hooks/useFileReceiverSocket";
import { useInitId } from "@/hooks/useInitId";
import { useRelayFileMetadata } from "@/hooks/query/useRelay";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// State Components
import MissingSenderId from "@/components/file-transfer/receiver/states/MissingSenderId";
import FileMetaError from "@/components/file-transfer/receiver/states/FileMetaError";
import FileMetaLoading from "@/components/file-transfer/receiver/states/FileMetaLoading";

// Motion components
const MotionCardTitle = motion.create(CardTitle);

export default function ReceivePageContent() {
  const senderId = useSearchParams().get("id");
  const id = useInitId("receiver");

  const { readyState } = UseFileReceiverSocket();

  const errorMessage = useFileReceiverStore((state) => state.errorMessage);
  const actions = useFileReceiverActions();

  const {
    data,
    isLoading: isFetchingFileMeta,
    error,
  } = useRelayFileMetadata(senderId ?? "");

  useEffect(() => {
    if (senderId && data) {
      actions.setFileMetadata(data);
      actions.setTransferConnection({ senderId });
    }
  }, [senderId, data, actions]);

  if (!senderId) return <MissingSenderId />;
  if (error) return <FileMetaError message={error.message} />;
  if (isFetchingFileMeta) return <FileMetaLoading />;

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
          <ReceiverFlow />
        </CardContent>
      </Card>
      {id && (
        <div className="fixed bottom-5 right-5 dark:text-white">
          <strong>Receiver ID: </strong> {id}
        </div>
      )}
    </>
  );
}
