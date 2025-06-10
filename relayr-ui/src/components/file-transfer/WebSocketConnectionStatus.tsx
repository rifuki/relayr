import { WebSocketStatusIndicator } from "./commons";

interface WebSocketConnectionStatusProps {
  readyState: number;
}

export default function WebSocketConnectionStatus({
  readyState,
}: WebSocketConnectionStatusProps) {
  return (
    <div className="space-x-1 flex items-center">
      <span className="font-medium">Websocket status:</span>
      <WebSocketStatusIndicator readyState={readyState} showText />
    </div>
  );
}
