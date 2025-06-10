// React
import { useId } from "react";

// ShadCN UI Component
import { Label } from "./ui/label";
import { Input } from "./ui/input";

// Internal Components
import CopyButton from "./CopyButton";
import { cn } from "@/lib/utils";

// Props interface for ShareableLinkInput component
interface ShareableLinkInputProps {
  label?: string;
  text: string;
  containerClassName?: string;
  disabled?: boolean;
}

/**
 * ShareableLinkInput component renders an accessible label linked to an input field
 * that displays a shareable text link along with a copy button.
 *
 * @param {ShareableLinkInputProps} props - Component props containing the shareable text and optional styling class.
 * @returns JSX.Element - A labeled input with a copy button for the provided text.
 */
export default function ShareableLinkInput({
  label = "Link for recipient",
  text,
  containerClassName,
  disabled,
}: ShareableLinkInputProps) {
  // Generate a unique ID for the input-label association
  const inputId = useId();

  return (
    <div className={cn("w-full space-y-1", containerClassName)}>
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
          value={text}
          className="w-full focus-visible:ring-0 focus-visible:border-0 cursor-default"
          tabIndex={disabled ? -1 : 0}
          onMouseDown={disabled ? (e) => e.preventDefault() : undefined}
          readOnly
        />
        <CopyButton text={text} disabled={disabled} />
      </div>
    </div>
  );
}
