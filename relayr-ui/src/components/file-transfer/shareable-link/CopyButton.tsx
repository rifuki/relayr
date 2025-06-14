// React
import { useState } from "react";

// External Libraries
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

// ShadCN UI Component
import { Button } from "@/components/ui/button";

// Utilities
import { copyToClipboard } from "@/utils/clipboard";

// Props interface for CopyButton component
interface CopyButtonProps {
  link: string;
  disabled?: boolean;
}

export default function CopyButton({ link, disabled }: CopyButtonProps) {
  // State to track if the text has been successfully copied
  const [isCopied, setIsCopied] = useState(false);

  // Handler for copy button click
  const handleCopy = async () => {
    if (disabled) return;

    const result = await copyToClipboard(link);
    if (result)
      toast.success("Copied to clipboard", {
        duration: 1000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    else
      toast.error("Failed to copy the share link.", {
        action: {
          label: "Close",
          onClick: () => {},
        },
      });

    setIsCopied(result);

    // Reset the copied state after 1.5 seconds to enable the button again
    setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <Button
      className="hover:bg-secondary/50 transition-colors cursor-pointer"
      variant="secondary"
      size="icon"
      onClick={handleCopy}
      disabled={isCopied || disabled}
    >
      {isCopied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
