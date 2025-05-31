"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Loader2Icon } from "lucide-react";

import AlertError from "@/components/AlertError";
import ReceiveFlow from "@/components/file-transfer/recipient/ReceiveFlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebSocketStatus from "@/components/WebSocketStatus";
import { useRelayFileMetadata } from "@/hooks/query/useRelay";
import { UseFileReceiverSocket } from "@/hooks/useFileReceiverSocket";
import { useInitId } from "@/hooks/useInitId";
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

function FetchingFileMetaLoadingAnimation() {
  return <Loader2Icon className="h-15 w-15 animate-spin" />;
}

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
    isError,
    error,
  } = useRelayFileMetadata(senderId ?? "");

  useEffect(() => {
    if (senderId && data) {
      actions.setFileMetadata(data);
      actions.setTransferConnection({ senderId });
    }
  }, [senderId, data, actions]);

  if (!senderId) return <div>Please ask sender for the correct link</div>;
  if (isError) return <div>Error: {error.message}</div>;

  if (isFetchingFileMeta) return <FetchingFileMetaLoadingAnimation />;

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
          <ReceiveFlow />
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
