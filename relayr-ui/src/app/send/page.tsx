"use client";

import FileCard from "@/components/file-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WS_RELAY_API_URL } from "@/lib/api";
import { copyToClipboard, getConnectionStatus } from "@/lib/utils";
import { FileMetadata } from "@/types/file";
import {
  CancelRecipientReadyResponse,
  RecipientReadyResponse,
  RegisterResponse,
} from "@/types/responses";
import {
  AlertCircleIcon,
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
  console.log(fileMetadata);

  const shareLink = useMemo(() => {
    if (!senderId) return null;
    return `${window.location.origin}/receive?id=${senderId}`;
  }, [senderId]);

  const { readyState, getWebSocket, sendJsonMessage } = useWebSocket(
    socketUrl,
    {
      onOpen: () => {
        console.log("✅ Connected");
      },
      onClose: (error) => {
        console.log("❌ Disconnected", error.code);

        setSenderId(null);
        setRecipientId(null);
        setSocketUrl(null);

        if (error.code === 1000) {
          return;
        } else if (error.code === 1006) {
          setErrorMsg("Lost connection to the server.");
          setIsLoading(false);
        } else {
          setErrorMsg(`Disconnected: Code ${error.code}`);
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
            } else if (!parsedMessage.success) {
              setErrorMsg(parsedMessage.message);
              setIsLoading(false);
            }
          } catch (error) {
            console.log("❌ Error parsing message:", error);
            setErrorMsg("Invalid websocket response message format!");
          }
        }
      },
    },
  );

  function generateLink() {
    setIsLoading(true);
    setSocketUrl(WS_RELAY_API_URL);
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

    const response = await fetch(url);
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
  }

  function handleCloseConnection() {
    getWebSocket()?.close(1000, "Sender closed the connection");
    const interval = setInterval(() => {
      if (getWebSocket()?.readyState === WebSocket.CLOSED) {
        clearInterval(interval);
        setSenderId(null);

        setSocketUrl(null);
        setIsLoading(false);
      }
    }, 100);
  }

  function handleCancelFileTransfer() {
    sendJsonMessage({
      type: "cancelSenderReady",
      recipientId,
    });
    setRecipientId(null);
  }

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

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader>
        <CardTitle>
          <span className="font-medium">Websocket Status: </span>
          <span className="font-bold">{getConnectionStatus(readyState)}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-5">
          {errorMsg && (
            <Alert
              variant="destructive"
              className="shadow-sm flex items-center"
            >
              <AlertCircleIcon className="flex-shrink-0" />
              <AlertDescription className="text-justify">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {!file &&
            !fileMetadata &&
            !senderId &&
            !shareLink &&
            !recipientId && (
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
              </>
            )}

          {file && fileMetadata && !senderId && !shareLink && !recipientId && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">File Selected</h1>
                <p className="text-muted-foreground">
                  Ready to generate a transfer link
                </p>
              </div>

              <FileCard file={fileMetadata} />
            </>
          )}

          {file && fileMetadata && senderId && shareLink && !recipientId && (
            <div className="flex flex-col space-y-10 items-center">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Waiting for Recipient</h1>
                <p className="text-sm text-muted-foreground">
                  Share the link with the recipient and wait for them to connect
                </p>
              </div>

              <CloudLightningIcon className="w-10 h-10" />

              <div className="w-full flex flex-col items-center space-y-5">
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
            </div>
          )}
        </div>

        {file && fileMetadata && senderId && shareLink && recipientId && (
          <div className="flex flex-col space-y-10 items-center">
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
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        {!file && !fileMetadata && !senderId && !shareLink && !recipientId && (
          <Button
            onClick={handlePrepareDummyFile}
            disabled={isFileLoading}
            className="w-full"
          >
            {isFileLoading ? (
              <>
                Loading <Loader2Icon className="animate-spin" />
              </>
            ) : (
              <>Prepare Dummy File</>
            )}
          </Button>
        )}

        {file && fileMetadata && !senderId && !shareLink && !recipientId && (
          <>
            <Button
              onClick={generateLink}
              disabled={isLoading}
              className="w-full"
            >
              Generate Sender link
            </Button>
            <Button
              onClick={handleUnselectFile}
              variant="destructive"
              className="w-full"
            >
              Remove File
            </Button>
          </>
        )}

        {file && senderId && shareLink && !recipientId && (
          <>
            <Button className="w-full" disabled>
              Waiting for the recipient to connect
              <Loader2Icon className="animate-spin" />
            </Button>
            <Button
              onClick={handleCloseConnection}
              variant="destructive"
              className="w-full"
            >
              Stop Sharing
            </Button>
          </>
        )}

        {file && senderId && shareLink && recipientId && (
          <>
            <Button
              onClick={() => toast.success("Sending File!")}
              className="w-full"
            >
              Send File
            </Button>
            <Button
              onClick={handleCancelFileTransfer}
              variant="destructive"
              className="w-full"
            >
              Cancel File Transfer
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
