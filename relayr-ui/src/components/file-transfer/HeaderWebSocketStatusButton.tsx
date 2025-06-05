// React
import { useState } from "react";

// ShadCN UI Components
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

// Internal Components
import WebSocketStatusIndicator from "./commons/WebSocketStatusIndicator";

// Props interface for HeaderWebSocketStatusButton component
interface HeaderWebSocketStatusButtonProps {
  readyState: number;
}

export default function HeaderWebSocketStatusButton({
  readyState,
}: HeaderWebSocketStatusButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Toggle tooltip visibility
  const handleTooltipToggle = () => setTooltipOpen((open) => !open);

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger
        onClick={handleTooltipToggle}
        onTouchStart={handleTooltipToggle}
        asChild
      >
        <Button
          className="bg-transparent h-8 w-8"
          variant="outline"
          size="icon"
        >
          {/* WebSocket status icon (e.g. connected, connecting, closed) */}
          <WebSocketStatusIndicator readyState={readyState} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        WebSocket:{" "}
        <WebSocketStatusIndicator
          readyState={readyState}
          showText // Show label like "Connected", "Closed", etc.
        />
      </TooltipContent>
    </Tooltip>
  );
}
