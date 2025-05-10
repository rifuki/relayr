"use client";

import useWebSocket from "react-use-websocket";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { getConnectionStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WS_RELAY_API_URL, RELAY_API_URL } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CloudLightningIcon,
  Loader2Icon,
} from "lucide-react";
import { FileMetadata } from "@/types/file";
import FileCard from "@/components/FileCard";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SenderId404Page from "./SenderId404Page";
import { toast } from "sonner";
import { RegisterResponse } from "@/types/webSocketMessages";

export default function ReceiveClientPage() {
  const searchParams = useSearchParams();
  const senderId = searchParams.get("id");

  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectedToServer, setIsConnectedToServer] = useState(false);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [isSenderReadyCanceled, setIsSenderReadyCanceled] = useState(false);

  const [isWaitingForSenderStart, setIsWaitingForSenderStart] = useState(true);
  const [isSenderUploadingFile, setIsSenderUploadingFile] = useState(false);
  const [senderTransferringProgress, setSenderTransferringProgress] =
    useState(0);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);

  const totalChunksRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const chunkDataSize = useRef(0);
  const uploadedSize = useRef(0);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const receivedBytes = useRef(0);

  async function fetchFileMeta(senderId: string): Promise<FileMetadata | null> {
    try {
      setIsLoadingPage(true);
      const res = await axios.get<FileMetadata>(
        `${RELAY_API_URL}/file-meta/${senderId}`,
      );
      console.log(`${RELAY_API_URL}/file-meta/${senderId}`);
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.error("File metadata not found");
      } else {
        console.error("Failed to fetch file metadata: ", error);
      }
      return null;
    } finally {
      setIsLoadingPage(false);
    }
  }

  useEffect(() => {
    if (!senderId) return;
    fetchFileMeta(senderId).then((fileMeta) => {
      setFileMetadata(fileMeta);
    });
  }, [senderId]);

  const { readyState, getWebSocket, sendJsonMessage } = useWebSocket(
    socketUrl,
    {
      onOpen: () => {
        sendJsonMessage({
          type: "recipientReady",
          senderId: senderId,
        });
      },
      onClose: (error) => {
        console.info("❌ Disconnected", error.code);
        setIsConnecting(false);
        setIsConnectedToServer(false);
        setRecipientId(null);
        setSocketUrl(null);

        if (error.code === 1000) {
          return;
        } else if (error.code == 1006) {
          setErrorMsg("Lost connection to the server");
        } else {
          setErrorMsg(`Disconnected: Code ${error.code}`);
        }
      },
      onError: (error) => {
        console.error("🔥 Error", error);
        setErrorMsg("WebSocket error occurred.");
      },
      shouldReconnect: () => false,
      onMessage: async (message) => {
        const messageData = message.data;
        if (typeof messageData === "string") {
          try {
            const parsedMessage = JSON.parse(messageData);
            console.log(parsedMessage);
            if (parsedMessage.type === "register") {
              const registerResponse: RegisterResponse = parsedMessage;
              setRecipientId(registerResponse.connId);
              setIsConnectedToServer(true);
              setIsConnecting(false);
            } else if (parsedMessage.type === "cancelSenderReady") {
              const errMsg = "The sender has canceled the connection.";
              setErrorMsg(errMsg);
              setIsSenderReadyCanceled(true);
              sendJsonMessage({
                type: "cancelRecipientReady",
                senderId: senderId,
              });
              getWebSocket()?.close(1000, errMsg);

              setIsConnectedToServer(false);
              setRecipientId(null);
              setSocketUrl(null);
            } else if (parsedMessage.type === "fileChunk") {
              setIsWaitingForSenderStart(false);
              setIsSenderUploadingFile(true);
              totalChunksRef.current = parsedMessage.totalChunks;
              chunkIndexRef.current = parsedMessage.chunkIndex;
              chunkDataSize.current = parsedMessage.chunkDataSize;
              uploadedSize.current = parsedMessage.uploadedSize;
              setSenderTransferringProgress(parsedMessage.transferProgress);
            } else if (parsedMessage.type === "fileEnd") {
              const message = {
                type: "fileTransferAck",
                status: "completed",
                fileName: fileMetadata?.name,
                totalChunks: totalChunksRef.current,
                chunkIndex: chunkIndexRef.current,
                uploadedSize: uploadedSize.current,
                senderId,
              };
              sendJsonMessage(message);
              setIsSenderUploadingFile(false);
              completeFileTransfer();
            } else if (!parsedMessage.success) {
              setErrorMsg(parsedMessage.message);
              handleCloseConnection();
              setIsConnecting(false);
            } else {
              console.error("❌ WS message not handled yet!");
            }
          } catch (error) {
            console.error("❌ Error parsing message:", error);
            setErrorMsg("Invalid websocket response message format!");
          }
        } else if (messageData instanceof Blob) {
          try {
            const result = await messageData.arrayBuffer();

            handleReceiveChunk(result as ArrayBuffer);

            const message = {
              type: "fileTransferAck",
              status: "acknowledged",
              fileName: fileMetadata?.name,
              totalChunks: totalChunksRef.current,
              chunkIndex: chunkIndexRef.current,
              chunkDataSize: chunkDataSize.current,
              uploadedSize: uploadedSize.current,
              transferProgress: senderTransferringProgress,
              senderId,
            };
            sendJsonMessage(message);
          } catch (error) {
            console.error("Failed to read blob as ArrayBuffer:", error);
            toast.error("Error reading file chunk");
          }
        }
      },
    },
  );

  function handleConnectToSender() {
    setErrorMsg(null);
    setIsConnecting(true);
    setSocketUrl(WS_RELAY_API_URL);
  }

  function handleCloseConnection() {
    sendJsonMessage({
      type: "cancelRecipientReady",
      senderId: senderId,
    });
    getWebSocket()?.close(1000, "Recipient closed the connection");
    const interval = setInterval(() => {
      if (getWebSocket()?.readyState === WebSocket.CLOSED) {
        clearInterval(interval);
        setRecipientId(null);

        setIsConnectedToServer(false);
        setSocketUrl(null);
      }
    }, 100);
  }

  function handleReceiveChunk(chunkData: ArrayBuffer) {
    if (!fileMetadata || !chunkData || chunkData.byteLength === 0) {
      return;
    }
    receivedChunksRef.current.push(chunkData);
    const newReceivedBytes = receivedBytes.current + chunkData.byteLength;
    receivedBytes.current = newReceivedBytes;

    if (receivedBytes.current !== uploadedSize.current) {
    } // handle ntar

    if (fileMetadata!.size > 0) {
      const progress = Math.min(
        100,
        Math.floor((newReceivedBytes / fileMetadata.size) * 100),
      );
    }
  }

  function completeFileTransfer() {
    try {
      const blob = new Blob(receivedChunksRef.current, {
        type: fileMetadata?.type || "application/octet-stream",
      });

      if (blob.size === 0) {
        setErrorMsg("Received file is empty. Transfer may have failed.");
        return;
      }

      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      console.log("Download URL:", url);
      setIsTransferCompleted(true);
    } catch (error) {
      console.error("❌ Failed to complete file transfer:", error);
      setErrorMsg("Failed to process the received file. Please try again.");
      toast.error("An error occurred while creating the file.");
    }
  }

  function handleDownloadFile() {
    if (!fileUrl || !fileMetadata) return;

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileMetadata?.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    receivedChunksRef.current = [];
  }

  useEffect(() => {
    function handleBeforeUnload() {
      if (readyState === WebSocket.OPEN && senderId) {
        sendJsonMessage({
          type: "cancelRecipientReady",
          senderId: senderId,
        });
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [readyState, senderId, sendJsonMessage]);

  if (!senderId) return <SenderId404Page />;

  if (isLoadingPage) return <Loader2Icon className="h-10 w-10 animate-spin" />;

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      {!fileMetadata && (
        <CardContent>
          <Alert variant="destructive" className="shadow-sm flex items-center">
            <AlertTriangleIcon className="flex-shrink-0" />
            <AlertDescription className="text-justify">
              File metadata not found. Please ask the sender to generate a new
              link.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}

      {fileMetadata && (
        <>
          <CardHeader>
            <CardTitle>
              <span className="font-medium">Websocket Status: </span>
              <span className="font-bold">
                {getConnectionStatus(readyState)}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col space-y-5">
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

            {!recipientId && !isConnectedToServer && (
              <div className="flex flex-col space-y-10 items-center">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">Ready to Receive</h1>
                  <p className="text-muted-foreground">
                    Connect to the server to receive the file
                  </p>
                </div>

                <CloudLightningIcon className="w-10 h-10" />

                <div className="w-full flex flex-col items-center space-y-5">
                  <Badge className="p-2 bg-primary/90">
                    Sender ID: {senderId}
                  </Badge>

                  <FileCard fileMetadata={fileMetadata} />
                </div>
              </div>
            )}

            {recipientId &&
              isConnectedToServer &&
              isWaitingForSenderStart &&
              !isSenderUploadingFile && (
                <div className="flex flex-col space-y-10 items-center">
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Getting Ready</h1>
                    <p className="text-muted-foreground">
                      Waiting for the sender to start the upload
                    </p>
                  </div>

                  <CloudLightningIcon className="w-10 h-10" />

                  <div className="w-full flex flex-col items-center space-y-5">
                    <Badge className="p-2 bg-primary/90">
                      Sender ID: {senderId}
                    </Badge>

                    <FileCard fileMetadata={fileMetadata} />

                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Transferring Progress</span>
                        <span>{senderTransferringProgress}%</span>
                      </div>

                      <Progress />
                    </div>
                  </div>
                </div>
              )}

            {recipientId &&
              isConnectedToServer &&
              isSenderUploadingFile &&
              !isTransferCompleted && (
                <div className="flex flex-col space-y-10 items-center">
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Receiving File</h1>
                    <p className="text-muted-foreground">
                      The file is being transferred. Please wait a moment.
                    </p>
                  </div>

                  <CloudLightningIcon className="w-10 h-10" />

                  <div className="w-full flex flex-col items-center space-y-5">
                    <Badge className="p-2 bg-primary/90">
                      Sender ID: {senderId}
                    </Badge>

                    <FileCard fileMetadata={fileMetadata} />

                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Transferring...</span>
                        <span>{senderTransferringProgress}%</span>
                      </div>

                      <Progress value={senderTransferringProgress} />
                    </div>
                  </div>
                </div>
              )}

            {isTransferCompleted && (
              <div className="flex flex-col space-y-10 items-center">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">Transfer Completed</h1>
                  <p className="text-muted-foreground">
                    The file has been successfully received.
                  </p>
                </div>

                <CloudLightningIcon className="w-10 h-10" />

                <div className="w-full flex flex-col items-center space-y-5">
                  <Badge className="p-2 bg-primary/90">
                    Sender ID: {senderId}
                  </Badge>

                  <FileCard fileMetadata={fileMetadata} />

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transferring Progress</span>
                      <span>{senderTransferringProgress}%</span>
                    </div>
                    <Progress value={senderTransferringProgress} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {!isConnectedToServer ? (
              <Button
                onClick={handleConnectToSender}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  "Connect to Server"
                )}
              </Button>
            ) : (
              <div className="w-full flex flex-col space-y-2">
                <Button
                  onClick={handleDownloadFile}
                  disabled={isWaitingForSenderStart || isSenderUploadingFile}
                  className="w-full"
                >
                  {isWaitingForSenderStart || isSenderUploadingFile ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Please keep this window open
                    </>
                  ) : (
                    "Download File"
                  )}
                </Button>
                <Button
                  onClick={handleCloseConnection}
                  variant="destructive"
                  className="w-full"
                >
                  Abort Download
                </Button>
              </div>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
