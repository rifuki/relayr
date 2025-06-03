// React
import { useState } from "react";

// External Libraries
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

// ShadCN UI Component
import { Button } from "./ui/button";

// Utilities
import { copyToClipboard } from "@/lib/utils";

// Props interface for CopyButton component
interface CopyButtonProps {
  text: string;
}

/**
 * CopyButton component renders a button that copies the given text to clipboard.
 * It provides visual feedback by toggling between copy and check icons,
 * and shows toast notifications on success or failure.
 *
 * @param {CopyButtonProps} props - Component props containing the text to copy.
 * @returns JSX.Element - A button UI element for copying text.
 */
export default function CopyButton({ text }: CopyButtonProps) {
  // State to track if the text has been successfully copied
  const [isCopied, setIsCopied] = useState(false);

  // Handler for copy button click
  const handleCopy = async () => {
    const result = await copyToClipboard(text);
    if (result)
      toast.success("Copied to clipboard", {
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
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <Button
      className="cursor-pointer transition-colors hover:bg-secondary/50"
      onClick={handleCopy}
      size="icon"
      variant="secondary"
      disabled={isCopied}
    >
      {isCopied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
