import { Label } from "./ui/label";
import { Input } from "./ui/input";
import CopyButton from "./CopyButton";

interface ShareableLinkInputProps {
  text: string;
  className?: string;
}

export default function ShareableLinkInput({
  text,
  className = "",
}: ShareableLinkInputProps) {
  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor="share-link" className="text-xs text-muted-foreground">
        Link for recipient
      </Label>
      <div className="w-full flex gap-2">
        <Input id="share-link" value={text} className="w-full" readOnly />
        <CopyButton text={text} />
      </div>
    </div>
  );
}
