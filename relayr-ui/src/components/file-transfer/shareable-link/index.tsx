// React
import { useId } from "react";

// ShadCN UI Component
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";

// Internal Components
import CopyButton from "./CopyButton";
import QrButton from "./QrButton";

// Tailwind CSS utility function
import { cn } from "@/lib/utils";

interface ShareableLinkProps {
  label?: string;
  link: string;
  containerClassName?: string;
  disabled?: boolean;
}

export default function ShareableLink({
  label = "Link for recipient",
  link,
  containerClassName,
  disabled,
}: ShareableLinkProps) {
  // Generate a unique ID for the input-label association
  const inputId = useId();

  return (
    <div className={cn("w-full flex flex-col gap-1", containerClassName)}>
      <Label htmlFor={inputId} className="text-xs text-muted-foreground">
        <p>
          {label}{" "}
          {disabled && (
            <span className="text-destructive">[No longer valid]</span>
          )}
        </p>
      </Label>
      <div className="w-full flex gap-2">
        <Input
          id={inputId}
          value={link}
          className="w-full focus-visible:ring-0 focus-visible:border-0 cursor-default"
          tabIndex={disabled ? -1 : 0}
          onMouseDown={disabled ? (e) => e.preventDefault() : undefined}
          readOnly
        />
        <QrButton link={link} disabled={disabled} />
        <CopyButton link={link} disabled={disabled} />
      </div>
    </div>
  );
}
