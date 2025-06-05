// Description: A React component that displays the WebSocket connection status with animations.
const statusMap = [
  { text: "Connecting", color: "yellow-500" },
  { text: "Connected", color: "green-500" },
  { text: "Closing", color: "orange-500" },
  { text: "Disconnected", color: "red-500" },
];

// Props interface for WebSocketStatusIndicator component
interface WebSocketStatusIndicatorProps {
  readyState: number;
  showText?: boolean;
}

/**
 * WebSocketStatusIndicator component displays the WebSocket connection status.
 * It shows a colored dot and optionally the status text.
 *
 * @param {WebSocketStatusIndicatorProps} props - The properties for the component.
 * @returns JSX.Element The rendered component.
 */
export default function WebSocketStatusIndicator({
  readyState,
  showText = false,
}: WebSocketStatusIndicatorProps) {
  // Get the status object based on the readyState, default to "Disconnected" if out of range
  const status = statusMap[readyState] || {
    text: "Disconnected",
    color: "red-500",
  };

  // If showText is true, render a status label (e.g. "Connecting") with appropriate color
  if (showText)
    return (
      <span className={`font-semibold tracking-tight text-${status.color}`}>
        {status.text}
      </span>
    );

  // Otherwise, render a small colored circle
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full bg-${status.color} ${readyState === 1 ? "animate-pulse" : ""}`}
    />
  );
}
