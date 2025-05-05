import { getConnectionStatus } from "@/lib/utils";

interface WebSocketStatusProps {
  readyState: number;
}

export default function WebSocketStatus({ readyState }: WebSocketStatusProps) {
  return (
    <div>
      <span className="font-medium">Websocket status: </span>
      <span className="font-bold">{getConnectionStatus(readyState)}</span>
    </div>
  );
}
