import React from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface AlertErrorProps {
  message: string;
}

const CustomAlertError: React.FC<AlertErrorProps> = ({ message }) => {
  return (
    <Alert variant="destructive" className="shadow-sm flex items-center mb-5">
      <AlertCircleIcon className="flex-shrink-0" />
      <AlertDescription className="text-justify">{message}</AlertDescription>
    </Alert>
  );
};

export default CustomAlertError;
