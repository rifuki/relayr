import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface AlertErrorProps {
  message: string;
}

export default function AlertError({ message }: AlertErrorProps) {
  return (
    <Alert variant="destructive" className="shadow-sm flex items-center mb-5">
      <AlertCircleIcon className="flex-shrink-0" />
      <AlertDescription className="text-justify">{message}</AlertDescription>
    </Alert>
  );
}
