// React
import { useState } from "react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Internal Components
import { WebSocketStatusIndicator } from "./";

// Props interface for HeaderWebSocketStatusButton component
interface HeaderWebSocketStatusButtonProps {
  readyState: number;
}

export default function HeaderWebSocketStatusButton({
  readyState,
}: HeaderWebSocketStatusButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <Button
          className="bg-transparent h-8 w-8"
          variant="outline"
          size="icon"
          onClick={() => setTooltipOpen(true)}
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          onTouchStart={() => setTooltipOpen(true)}
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
