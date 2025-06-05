// External Libraries
import WebSocketStatusIndicator from "../commons/WebSocketStatusIndicator";

// Props interface for TransferConnectionStatus component
interface WebSocketStatusProps {
  readyState: number;
}

/**
 * TransferConnectionStatus component displays the current
 * WebSocket connection status for file transfers.
 * @param {WebSocketStatusProps} props - The properties for the component.
 *
 * @return JSX.Element The rendered component.
 */
export default function TransferConnectionStatus({
  readyState,
}: WebSocketStatusProps) {
  return (
    <div className="space-x-1 flex items-center">
      <span className="font-medium">Websocket status:</span>
      <WebSocketStatusIndicator readyState={readyState} showText />
    </div>
  );
}
