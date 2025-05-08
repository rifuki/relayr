import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "./ui/button";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const res = await copyToClipboard(text);
    if (res) toast.success("Copied to clipboard");
    else toast.error("Failed to copy the share link.");

    setIsCopied(res);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <Button
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
