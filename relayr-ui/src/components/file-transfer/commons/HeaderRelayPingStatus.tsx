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

// API
import { useRelayPing } from "@/hooks/query/useRelay";

export default function HeaderRelayPingStatus() {
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
    text = "unreachable";
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
            className="bg-transparent h-8 w-8"
            variant="outline"
            size="icon"
            onClick={() => setTooltipOpen(true)}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onTouchStart={() => setTooltipOpen(true)}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Latency:{" "}
          <span className={`text-xs font-medium ${textColor}`}>{text}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
