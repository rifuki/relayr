import { Loader2Icon } from "lucide-react";

export default function InitialTransitionLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-112">
      <Loader2Icon className="h-12 w-12 animate-spin" />
    </div>
  );
}
