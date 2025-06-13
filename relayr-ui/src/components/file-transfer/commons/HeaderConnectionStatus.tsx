// React
import { useState } from "react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Internal Components
import WebSocketStatusIndicator from "./WebSocketStatusIndicator";

// API
import { useRelayPing } from "@/hooks/query/useRelay";

// Props interface for HeaderWebSocketStatusButton component
interface HeaderConnectionStatusProps {
  readyState: number;
}

export default function HeaderConnectionStatus({
  readyState,
}: HeaderConnectionStatusProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { data, isLoading, isError } = useRelayPing({ intervalMs: 2000 });
  let color = "bg-red-500";
  let text = "-";
  let textColor = "text-red-500";

  if (isLoading) {
    color = "bg-yellow-500 animate-pulse";
    text = "...";
    textColor = "text-yellow-500";
  } else if (isError) {
    color = "bg-red-500";
    text = "Unreachable";
    textColor = "text-red-500";
  } else if (typeof data?.ms === "number") {
    if (data.ms < 100) {
      color = "bg-green-500 animate-pulse";
      textColor = "text-green-500";
    } else if (data.ms < 300) {
      color = "bg-yellow-500 animate-pulse";
      textColor = "text-yellow-500";
    } else {
      color = "bg-red-500 animate-pulse";
      textColor = "text-red-500";
    }
    text = `${data.ms}ms`;
  }

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            className="bg-transparent h-8 w-8 cursor-pointer"
            variant="outline"
            size="icon"
            onClick={() => setTooltipOpen(true)}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onTouchStart={() => setTooltipOpen(true)}
          >
            {/* Relay ping status indicator */}
            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm font-semibold text-center">
              Connection Status
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>Latency </p>
                <span className={`text-xs font-bold ${textColor}`}>{text}</span>
              </div>
              <div>
                <p>WebSocket </p>
                <WebSocketStatusIndicator readyState={readyState} showText />
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
