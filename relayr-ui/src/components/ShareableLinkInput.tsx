import { Label } from "./ui/label";
import { Input } from "./ui/input";
import CopyButton from "./CopyButton";
import { nanoid } from "nanoid";

interface ShareableLinkInputProps {
  text: string;
  className?: string;
}

export default function ShareableLinkInput({
  text,
  className = "",
}: ShareableLinkInputProps) {
  const uniqueid = nanoid();
  return (
    <div className={`w-full ${className}`}>
      <Label
        htmlFor={`share-link-${uniqueid}`}
        className="text-xs text-muted-foreground"
      >
        Link for recipient
      </Label>
      <div className="w-full flex gap-2">
        <Input
          id={`share-link-${uniqueid}`}
          value={text}
          className="w-full"
          readOnly
        />
        <CopyButton text={text} />
      </div>
    </div>
  );
}
