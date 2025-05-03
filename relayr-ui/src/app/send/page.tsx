"use client";

import CustomAlertError from "@/components/CustomAlertError";
import FileCard from "@/components/FileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { WS_RELAY_API_URL } from "@/lib/api";
import { CHUNK_SIZE } from "@/lib/constants";
import { copyToClipboard, getConnectionStatus } from "@/lib/utils";
import { FileMetadata } from "@/types/file";
import {
  CancelRecipientReadyResponse,
  RecipientReadyResponse,
  RegisterResponse,
} from "@/types/responses";
import {
  CheckIcon,
  CloudLightningIcon,
  CopyIcon,
  FileIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { toast } from "sonner";

export default function SendPage() {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const totalChunksRef = useRef(0);
  const offsetRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const chunkDataSizeRef = useRef(0);

  const [isTransferringFile, setIsTransferringFile] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);

  function resetChunkTransfer() {
    setIsTransferringFile(false);
    setTransferProgress(0);
    totalChunksRef.current = 0;
    offsetRef.current = 0;
    chunkIndexRef.current = 0;
    chunkDataSizeRef.current = 0;
  }

  function isFolderLike(file: File): boolean {
    // Common indicators that it might be a folder:
    // 1. Zero size and no type
    // 2. Special webkitRelativePath (if available)
    const fileWithPath = file as File & { webkitRelativePath?: string };
    return (
      (file.size === 0 && file.type === "") ||
      fileWithPath.webkitRelativePath?.length > 0
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length === 0 || !e.target.files) return;

    setErrorMsg(null);
    setFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const items = e.dataTransfer.items;

    if (!items || items.length === 0) return;

    const item = items[0];
    const itemWithEntry = item as DataTransferItem & {
      webkitGetAsEntry?: () => FileSystemEntry;
    };
    const entry = itemWithEntry.webkitGetAsEntry?.();
    if (entry && entry.isDirectory) {
      setErrorMsg("Cannot upload folders. Please select a single file.");
      return;
    }

    const droppedFile = e.dataTransfer.files[0];
    // Fallback check for folder-like characteristics
    if (isFolderLike(droppedFile)) {
      setErrorMsg("Cannot upload folders. Please select a single file.");
      return;
    }

    setErrorMsg(null);
    setFile(droppedFile);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  const fileMetadata: FileMetadata | null = useMemo(() => {
    if (!file) return null;
    setIsFileLoading(false);
    return {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }, [file]);

  const shareLink = useMemo(() => {
    if (!senderId) return null;
    return `${window.location.origin}/receive?id=${senderId}`;
  }, [senderId]);

  const { readyState, getWebSocket, sendJsonMessage, sendMessage } =
    useWebSocket(socketUrl, {
      onOpen: () => {
        console.log("✅ Connected");
      },
      onClose: (error) => {
        console.log("❌ Disconnected", error.code);

        if (error.code === 1000) {
          // Normal closure, don't reset senderId to preserve success state
          if (!isTransferCompleted) {
            setSenderId(null);
            setRecipientId(null);
            setSocketUrl(null);
          }
          return;
        } else if (error.code === 1006) {
          setErrorMsg("Lost connection to the server.");
          setIsLoading(false);
          setSenderId(null);
          setRecipientId(null);
          setSocketUrl(null);
        } else {
          setErrorMsg(`Disconnected: Code ${error.code}`);
          setSenderId(null);
          setRecipientId(null);
          setSocketUrl(null);
        }
      },
      onError: (error) => {
        console.log("🔥 Error", error);
        setErrorMsg("WebSocket error occurred.");
      },
      shouldReconnect: () => false,
      onMessage: (message) => {
        setErrorMsg(null);
        const messageData = message.data;
        if (typeof messageData === "string") {
          try {
            const parsedMessage = JSON.parse(messageData);
            console.log("Parsed message:", parsedMessage);
            if (parsedMessage.type === "register") {
              if (!fileMetadata) {
                return;
              }
              sendJsonMessage({
                type: "fileMeta",
                fileName: fileMetadata.name,
                fileSize: fileMetadata.size,
                mimeType: fileMetadata.type,
              });

              const registerResponse: RegisterResponse = parsedMessage;
              setSenderId(registerResponse.connId);
              setIsLoading(false);
            } else if (parsedMessage.type === "recipientReady") {
              const recipientReadyResponse: RecipientReadyResponse =
                parsedMessage;
              setRecipientId(recipientReadyResponse.recipientId);
            } else if (parsedMessage.type === "cancelRecipientReady") {
              const cancelRecipientReadyResponse: CancelRecipientReadyResponse =
                parsedMessage;
              setErrorMsg(
                `Recipient \`${cancelRecipientReadyResponse.recipientId}\` canceled the connection.`,
              );
              setRecipientId(null);
            } else if (parsedMessage.type === "ack") {
              if (!file) return;

              if (parsedMessage.status === "acknowledged") {
                if (
                  parsedMessage.chunkIndex !== chunkIndexRef.current &&
                  parsedMessage.uploadedSize !==
                    offsetRef.current + chunkDataSizeRef.current
                ) {
                  setErrorMsg(
                    "Upload out of sync. Please try again or check your connection.",
                  );
                  return;
                }

                if (offsetRef.current < file.size) {
                  offsetRef.current += chunkDataSizeRef.current;
                  chunkIndexRef.current += 1;
                  sendNextChunk();
                } else {
                  const message = {
                    type: "fileEnd",
                    fileName: file.name,
                    totalChunks: totalChunksRef.current,
                    chunkIndex: chunkIndexRef.current,
                    uploadedSize: offsetRef.current,
                    recipientId,
                  };
                  sendJsonMessage(message);
                }
              } else if (parsedMessage.status === "completed") {
                resetChunkTransfer();
                setIsTransferCompleted(true);
                toast.success("File transfer completed successfully!");
                // Keep connection open to maintain success state
                setTimeout(() => {
                  getWebSocket()?.close(1000, "Transfer completed");
                }, 500);
              }
            } else if (!parsedMessage.success) {
              setErrorMsg(parsedMessage.message);
              setIsLoading(false);
            } else {
              console.log("❌ WS message not handled yet!");
            }
          } catch (error) {
            console.log("❌ Error parsing message:", error);
            setErrorMsg("Invalid websocket response message format!");
          }
        }
      },
    });

  function generateLink() {
    setIsLoading(true);
    setSocketUrl(WS_RELAY_API_URL);
    setIsTransferringFile(false);
  }

  async function handleCopyShareLink() {
    if (typeof shareLink !== "string") {
      toast.error("Something went wrong while generating the link.");
      return;
    }

    const success = await copyToClipboard(shareLink);
    if (!success) {
      toast.error("Failed to copy the share link.");
    } else {
      toast.success("Copied to clipboard");
    }

    setIsLinkCopied(success);
    setTimeout(() => setIsLinkCopied(false), 1000);
  }

  async function handlePrepareDummyFile() {
    setIsFileLoading(true);
    const url = "/image.gif";
    const fileName = url.split("/").pop() || "downloaded-file";

    const controller = new AbortController();
    const response = await fetch(url, { signal: controller.signal });
    const blob = await response.blob();
    const file = new File([blob], fileName, {
      type: blob.type,
    });

    setFile(file);
    setErrorMsg(null);
  }

  function handleUnselectFile() {
    setErrorMsg(null);
    setFile(null);
    setIsTransferCompleted(false);
  }

  function handleCloseConnection() {
    getWebSocket()?.close(1000, "Sender closed the connection");
    setSenderId(null);
    setRecipientId(null);
    setSocketUrl(null);
    setIsLoading(false);
    setIsTransferCompleted(false);
  }

  function handleStartNewTransfer() {
    setSenderId(null);
    setRecipientId(null);
    setSocketUrl(null);
    setIsTransferCompleted(false);
  }

  function handleCancelFileTransfer() {
    resetChunkTransfer();
    sendJsonMessage({
      type: "cancelSenderReady",
      recipientId,
    });
    setRecipientId(null);
  }

  function handleSendFile() {
    if (!file || !recipientId) {
      if (!file && !recipientId) {
        toast.error("No file selected and recipient not connected.");
      } else if (!file) {
        toast.error("Please select a file before sending.");
      } else if (!recipientId) {
        toast.error("Recipient is not connected");
      }
      return;
    }

    setIsTransferringFile(true);

    totalChunksRef.current = Math.ceil(file.size / CHUNK_SIZE);
    chunkIndexRef.current = 0;
    offsetRef.current = 0;
    chunkDataSizeRef.current = 0;

    sendNextChunk();
  }

  async function readFileAsArrayBuffer(
    file: File,
    offset: number,
    chunkSize: number,
  ): Promise<{ chunkData: Uint8Array; chunkDataSize: number }> {
    try {
      const slice = file.slice(offset, offset + chunkSize);
      const result = await slice.arrayBuffer();

      const chunkData = new Uint8Array(result);
      const chunkDataSize = chunkData.byteLength;

      return {
        chunkData,
        chunkDataSize,
      };
    } catch (error: unknown) {
      console.error("Error reading file:", error);
      throw new Error("Failed to read file chunk");
    }
  }

  async function sendNextChunk() {
    if (!file || !recipientId) return;

    try {
      const { chunkData, chunkDataSize } = await readFileAsArrayBuffer(
        file,
        offsetRef.current,
        CHUNK_SIZE,
      );

      chunkDataSizeRef.current = chunkDataSize;

      const uploadedSize = offsetRef.current + chunkDataSize;
      const progressBar = Math.min(
        100,
        Math.floor(
          ((offsetRef.current + chunkDataSizeRef.current) / file.size) * 100,
        ),
      );

      const message = {
        type: "fileChunk",
        fileName: file.name,
        totalChunks: totalChunksRef.current,
        chunkIndex: chunkIndexRef.current,
        chunkDataSize,
        uploadedSize,
        transferProgress,
        recipientId,
      };
      sendJsonMessage(message);
      sendMessage(chunkData);

      setTransferProgress(progressBar);
    } catch (error: unknown) {
      console.error("Failed to send next chunk:", error);
      toast.error("Failed to send next chunk");
    }
  }

  useEffect(() => {
    handlePrepareDummyFile();
  }, []);

  useEffect(() => {
    function handleBeforeUnload() {
      if (readyState === WebSocket.OPEN && recipientId) {
        sendJsonMessage({
          type: "cancelSenderReady",
          recipientId,
        });
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [readyState, recipientId, sendJsonMessage]);

  // Determine which step we're at
  const renderStep = () => {
    // Step 1: Initial file selection
    if (!file && !fileMetadata && !senderId && !shareLink && !recipientId) {
      return (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Send a File</h1>
            <p className="text-muted-foreground">
              Select a file to share it securely via WebSocket
            </p>
          </div>

          <div
            className="p-10 border-2 border-dashed border-border/50 cursor-pointer hover:bg-secondary/50 flex flex-col justify-center items-center space-y-7"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Input
              type="file"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto rounded-xl bg-secondary/80 flex items-center justify-center">
              <FileIcon />
            </div>
            <div className="text-center">
              <p className="text-base font-medium">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
          </div>

          <Button
            onClick={handlePrepareDummyFile}
            disabled={isFileLoading}
            className="w-full mt-4"
          >
            {isFileLoading ? (
              <div className="flex items-center gap-2">
                Loading <Loader2Icon className="animate-spin ml-2" />
              </div>
            ) : (
              "Prepare Dummy File"
            )}
          </Button>
        </>
      );
    }

    // Step 2: File selected, ready to generate link
    if (file && fileMetadata && !senderId && !shareLink && !recipientId) {
      return (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">File Selected</h1>
            <p className="text-muted-foreground">
              Ready to generate a transfer link
            </p>
          </div>

          <FileCard file={fileMetadata} />

          <div className="flex flex-col gap-2 w-full mt-4">
            <Button
              onClick={generateLink}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  Generating link <Loader2Icon className="animate-spin ml-2" />
                </div>
              ) : (
                "Generate Sender Link"
              )}
            </Button>
            <Button
              onClick={handleUnselectFile}
              variant="destructive"
              className="w-full"
            >
              Remove File
            </Button>
          </div>
        </>
      );
    }

    // Step 3: Waiting for recipient
    if (
      file &&
      fileMetadata &&
      senderId &&
      shareLink &&
      !recipientId &&
      !isTransferCompleted
    ) {
      return (
        <div className="flex flex-col space-y-6 items-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Waiting for Recipient</h1>
            <p className="text-sm text-muted-foreground">
              Share the link with the recipient and wait for them to connect
            </p>
          </div>

          <CloudLightningIcon className="w-10 h-10" />

          <div className="w-full flex flex-col items-center space-y-5">
            <Badge className="p-2 bg-primary/90">Share this link:</Badge>
            <div className="w-full flex gap-2">
              <Input value={shareLink} className="w-full" readOnly />
              <Button
                onClick={handleCopyShareLink}
                size="icon"
                variant="secondary"
                disabled={isLinkCopied}
              >
                {!isLinkCopied ? (
                  <CopyIcon className="h-4 w-4" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            <FileCard file={fileMetadata} />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button className="w-full" disabled>
              <div className="flex items-center gap-2">
                Waiting for recipient{" "}
                <Loader2Icon className="animate-spin ml-2" />
              </div>
            </Button>
            <Button
              onClick={handleCloseConnection}
              variant="destructive"
              className="w-full"
            >
              Cancel Sharing
            </Button>
          </div>
        </div>
      );
    }

    // Step 4: Recipient connected, ready to transfer
    if (
      file &&
      fileMetadata &&
      senderId &&
      shareLink &&
      recipientId &&
      !isTransferringFile &&
      !isTransferCompleted
    ) {
      return (
        <div className="flex flex-col space-y-6 items-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Ready to Transfer</h1>
            <p className="text-sm text-muted-foreground">
              Recipient connected. You can now transfer the file.
            </p>
          </div>

          <CloudLightningIcon className="w-10 h-10" />

          <div className="w-full flex flex-col items-center space-y-5">
            <Badge className="p-2 bg-primary/90">
              Recipient ID: {recipientId}
            </Badge>

            <div className="w-full flex gap-2">
              <Input value={shareLink} className="w-full" readOnly />
              <Button
                onClick={handleCopyShareLink}
                size="icon"
                variant="secondary"
                disabled={isLinkCopied}
              >
                {!isLinkCopied ? (
                  <CopyIcon className="h-4 w-4" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            <FileCard file={fileMetadata} />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleSendFile} className="w-full">
              Send File
            </Button>
            <Button
              onClick={handleCancelFileTransfer}
              variant="destructive"
              className="w-full"
            >
              Cancel Transfer
            </Button>
          </div>
        </div>
      );
    }

    // Step 5: Transferring file
    if (
      file &&
      fileMetadata &&
      senderId &&
      shareLink &&
      recipientId &&
      isTransferringFile &&
      !isTransferCompleted
    ) {
      return (
        <div className="flex flex-col space-y-6 items-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Transferring File</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while the file is being transferred
            </p>
          </div>

          <CloudLightningIcon className="w-10 h-10" />

          <div className="w-full flex flex-col items-center space-y-5">
            <Badge className="p-2 bg-primary/90">
              Recipient ID: {recipientId}
            </Badge>

            <div className="w-full flex gap-2">
              <Input value={shareLink} className="w-full" readOnly />
              <Button
                onClick={handleCopyShareLink}
                size="icon"
                variant="secondary"
                disabled={isLinkCopied}
              >
                {!isLinkCopied ? (
                  <CopyIcon className="h-4 w-4" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            <FileCard file={fileMetadata} />

            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transferring...</span>
                <span>{transferProgress}%</span>
              </div>

              <Progress value={transferProgress} />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button disabled className="w-full">
              <div className="flex items-center gap-2">
                Sending ({transferProgress}%)
                <Loader2Icon className="animate-spin ml-2" />
              </div>
            </Button>
            <Button
              onClick={handleCancelFileTransfer}
              variant="destructive"
              className="w-full"
            >
              Cancel Transfer
            </Button>
          </div>
        </div>
      );
    }

    // Step 6: Transfer success
    if (isTransferCompleted && file && fileMetadata && shareLink) {
      return (
        <div className="flex flex-col space-y-6 items-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Transfer Successful!</h1>
            <p className="text-sm text-muted-foreground">
              Your file has been successfully transferred
            </p>
          </div>

          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <div className="w-full flex flex-col items-center space-y-5">
            <Badge className="p-2 bg-green-600">File Transferred</Badge>

            <FileCard file={fileMetadata} />

            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transfer Complete</span>
                <span>100%</span>
              </div>

              <Progress
                value={100}
                className="bg-green-100 dark:bg-green-900/30"
              />
            </div>

            {shareLink && (
              <div className="w-full mt-2">
                <p className="text-sm text-center mb-2">
                  Share this link again:
                </p>
                <div className="flex gap-2">
                  <Input value={shareLink} className="w-full" readOnly />
                  <Button
                    onClick={handleCopyShareLink}
                    size="icon"
                    variant="secondary"
                    disabled={isLinkCopied}
                  >
                    {!isLinkCopied ? (
                      <CopyIcon className="h-4 w-4" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleStartNewTransfer} className="w-full">
              Start New Transfer
            </Button>
            <Button
              onClick={handleUnselectFile}
              variant="outline"
              className="w-full"
            >
              Select Different File
            </Button>
          </div>
        </div>
      );
    }

    // Default case (should not reach here, but just in case)
    return (
      <p>
        Something went wrong with the transfer state. Please refresh the page.
      </p>
    );
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader>
        <CardTitle>
          <span className="font-medium">Websocket Status: </span>
          <span className="font-bold">{getConnectionStatus(readyState)}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {errorMsg && <CustomAlertError message={errorMsg} />}

        <div className="flex flex-col space-y-5">{renderStep()}</div>
      </CardContent>
    </Card>
  );
}
