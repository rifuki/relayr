"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebSocketStatus from "@/components/WebSocketStatus";
import SendFlow from "@/components/file-transfer/sender/SendFlow";
import AlertError from "@/components/AlertError";
import { useFileSenderSocket } from "@/hooks/useFileSenderSocket";
import { useFileSenderStore } from "@/stores/useFileSenderStore";

export default function SendPage() {
  const { readyState } = useFileSenderSocket();
  const errorMessage = useFileSenderStore((state) => state.errorMessage);

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
          <SendFlow />
        </div>
      </CardContent>
    </Card>
  );
}
