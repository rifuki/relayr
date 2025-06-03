// React
import { useId } from "react";

// ShadCN UI Component
import { Label } from "./ui/label";
import { Input } from "./ui/input";

// Internal Components
import CopyButton from "./CopyButton";

// Props interface for ShareableLinkInput component
interface ShareableLinkInputProps {
  text: string;
  className?: string;
}

/**
 * ShareableLinkInput component renders an accessible label linked to an input field
 * that displays a shareable text link along with a copy button.
 *
 * @param {ShareableLinkInputProps} props - Component props containing the shareable text and optional styling class.
 * @returns JSX.Element - A labeled input with a copy button for the provided text.
 */
export default function ShareableLinkInput({
  text,
  className = "",
}: ShareableLinkInputProps) {
  // Generate a unique ID for the input-label association
  const inputId = useId();

  return (
    <div className={`w-full space-y-1 ${className}`}>
      <Label htmlFor={inputId} className="text-xs text-muted-foreground">
        Link for recipient
      </Label>
      <div className="w-full flex gap-2">
        <Input
          id={inputId}
          value={text}
          className="w-full focus-visible:ring-0 focus-visible:border-0 cursor-default"
          readOnly
        />
        <CopyButton text={text} />
      </div>
    </div>
  );
}
