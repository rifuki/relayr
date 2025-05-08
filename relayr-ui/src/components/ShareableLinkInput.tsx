import { Label } from "./ui/label";
import { Input } from "./ui/input";
import CopyButton from "./CopyButton";

export default function ShareableLinkInput({ value }: { value: string }) {
  return (
    <div className="w-full ">
      <Label htmlFor="share-link" className="mt-2 text-xs text-muted-foreground">
        Link for recipient
      </Label>
      <div className="w-full flex gap-2">
        <Input id="share-link" value={value} className="w-full" readOnly />
        <CopyButton text={value} />
      </div>
    </div>
  );
}
