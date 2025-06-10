// React
import { useState } from "react";

// External Libraries
import { QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface QrButtonProps {
  link: string;
  disabled?: boolean;
}

export default function QrButton({ link, disabled }: QrButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={`cursor-pointer transition-opacity ${open ? "opacity-60" : "opacity-100"}`}
          variant="secondary"
          size="icon"
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-label="Show QR code"
        >
          <QrCodeIcon />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="flex justify-center items-center p-4">
          <QRCodeSVG value={link} className="w-full h-full max-w-xs max-h-xs" />
        </PopoverContent>
      )}
    </Popover>
  );
}
