import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SenderId404Page() {
  return (
    <div className="w-full max-w-sm sm:max-w-md">
      <Alert
        variant="destructive"
        className="flex justify-between items-center font-bold"
      >
        <AlertCircle />
        <AlertDescription className="text-justify">
          You need sender ID to receive file. Ask the sender to generate a link!
        </AlertDescription>
      </Alert>
    </div>
  );
}
