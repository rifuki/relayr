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
import { useEffect, useState } from "react";
import { getConnectionStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WS_RELAY_API_URL, RELAY_API_URL } from "@/lib/api";
import { FileMetaResponse, RegisterResponse } from "@/types/responses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CloudLightningIcon,
  Loader2Icon,
} from "lucide-react";
import { FileMetadata } from "@/types/file";
import FileCard from "@/components/file-card";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SenderId404Page from "./SenderId404Page";

export default function ReceiveClientPage() {
  const searchParams = useSearchParams();
  const senderId = searchParams.get("id");

  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectedToServer, setIsConnectedToServer] = useState(false);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [senderProgress, setSenderProgress] = useState<number | null>(null);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [isSenderReadyCanceled, setIsSenderReadyCanceled] = useState(false);

  async function fetchFileMeta(senderId: string): Promise<FileMetadata | null> {
    try {
      setIsLoadingPage(true);
      const res = await axios.get<FileMetadata>(
        `${RELAY_API_URL}/file-meta/${senderId}`,
      );
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("File metadata not found");
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
        console.log("❌ Disconnected", error.code);
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
        console.log("🔥 Error", error);
        setErrorMsg("WebSocket error occurred.");
      },
      shouldReconnect: () => false,
      onMessage: (message) => {
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
            } else if (parsedMessage.type === "fileMeta") {
              const fileMetaResponse: FileMetaResponse = parsedMessage;
              const fileMetadata: FileMetadata = {
                name: fileMetaResponse.fileName,
                size: fileMetaResponse.fileSize,
                type: fileMetaResponse.mimeType,
              };
              setFileMetadata(fileMetadata);
            } else if (!parsedMessage.success) {
              setErrorMsg(parsedMessage.message);
              handleCloseConnection();
              setIsConnecting(false);
            }
          } catch (error) {
            console.log("❌ Error parsing message:", error);
            setErrorMsg("Invalid websocket response message format!");
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

                  <FileCard file={fileMetadata} />
                </div>
              </div>
            )}

            {recipientId && isConnectedToServer && !senderProgress && (
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

                  <FileCard file={fileMetadata} />
                </div>
              </div>
            )}

            {recipientId && isConnectedToServer && senderProgress && (
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

                  <FileCard file={fileMetadata} />

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sender Uploading to Server</span>
                      <span>75%</span>
                    </div>

                    <Progress value={75} />
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recipient Download from Server</span>
                      <span>30%</span>
                    </div>

                    <Progress value={30} />
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
              <Button
                onClick={handleCloseConnection}
                variant="destructive"
                className="w-full"
              >
                Abort Download
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
