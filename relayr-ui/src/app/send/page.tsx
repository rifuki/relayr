"use client";

import AlertError from "@/components/AlertError";
import FileSelector from "@/components/send/FileSelector";
import ReadyToTransfer from "@/components/send/ReadyToTransfer";
import SelectedFile from "@/components/send/SelectedFile";
import TransferCompleted from "@/components/send/TransferCompleted";
import WaitingForRecipient from "@/components/send/WaitingForRecipient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebSocketStatus from "@/components/WebSocketStatus";
import { useWebsocketSender } from "@/hooks/useWebsocketSender";
import { FileMetadata } from "@/types/file";
import { useMemo, useState } from "react";

export default function SendPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileMetadata: FileMetadata | null = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }, [file]);

  const {
    readyState,
    errorMessage,
    connectionInfo,
    setErrorMessage,
    handleGenerateTransferFileLink,
    handleCloseWebSocketConnection,
    transferFileShareLink,
    isTransferFileComplete,
    isTransferringFile,
    handleSendFile,
    handleCancelSenderReady,
    transferFileProgress,
    completedRecipientId,
    completedTransferFileLink,
    resetAllStates,
    isPageLoading,
  } = useWebsocketSender();

  console.log({
    file,
    fileMetadata,
    connectionInfo,
    transferFileShareLink,
    isTransferFileComplete,
    completedRecipientId,
    completedTransferFileLink,
  });

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader>
        <CardTitle>
          <WebSocketStatus readyState={readyState} />
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-5">
          {errorMessage && <AlertError message={errorMessage} />}

          {/* File selection state */}
          {!file &&
            !fileMetadata &&
            !connectionInfo.senderId &&
            !transferFileShareLink &&
            !connectionInfo.recipientId &&
            !isTransferFileComplete &&
            !completedRecipientId &&
            !completedTransferFileLink && (
              <FileSelector
                setFile={setFile}
                setErrorMessage={setErrorMessage}
              />
            )}

          {/* File selected state */}
          {file &&
            fileMetadata &&
            !connectionInfo.senderId &&
            !transferFileShareLink &&
            !connectionInfo.recipientId &&
            !isTransferFileComplete &&
            !completedRecipientId &&
            !completedTransferFileLink && (
              <SelectedFile
                file={file}
                setFile={setFile}
                fileMetadata={fileMetadata}
                handleGenerateTransferLink={handleGenerateTransferFileLink}
                isPageLoading={isPageLoading}
              />
            )}

          {/* Waiting for recipient state */}
          {file &&
            fileMetadata &&
            connectionInfo.senderId &&
            transferFileShareLink &&
            !connectionInfo.recipientId &&
            !isTransferFileComplete &&
            !completedRecipientId &&
            !completedTransferFileLink && (
              <WaitingForRecipient
                fileMetadata={fileMetadata}
                transferFileShareLink={transferFileShareLink}
                handleCloseWebSocketConnection={handleCloseWebSocketConnection}
              />
            )}

          {/* Ready to transfer state */}
          {file &&
            fileMetadata &&
            connectionInfo.senderId &&
            transferFileShareLink &&
            connectionInfo.recipientId &&
            !isTransferFileComplete &&
            !completedRecipientId &&
            !completedTransferFileLink && (
              <ReadyToTransfer
                recipientId={connectionInfo.recipientId}
                transferFileShareLink={transferFileShareLink}
                fileMetadata={fileMetadata}
                transferFileProgress={transferFileProgress}
                isTransferringFile={isTransferringFile}
                isTranferringFileComplete={isTransferFileComplete}
                handleSendFile={handleSendFile}
                handleCancelSenderReady={handleCancelSenderReady}
              />
            )}

          {/* Transfer completed state */}
          {file &&
            fileMetadata &&
            !connectionInfo.senderId &&
            !transferFileShareLink &&
            !connectionInfo.recipientId &&
            isTransferFileComplete &&
            completedRecipientId &&
            completedTransferFileLink && (
              <TransferCompleted
                completedRecipientId={completedRecipientId}
                completedTransferFileShareLink={completedTransferFileLink}
                file={file}
                fileMetadata={fileMetadata}
                handleGenerateTransferFileLink={handleGenerateTransferFileLink}
                setFile={setFile}
                resetAllStates={resetAllStates}
              />
            )}
        </div>
      </CardContent>
    </Card>
  );
}
