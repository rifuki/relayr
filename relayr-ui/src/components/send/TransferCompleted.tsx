import { FileCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import FileCard from "../FileCard";
import { FileMetadata } from "@/types/file";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface TransferCompletedProps {
  completedRecipientId: string;
  file: File;
  fileMetadata: FileMetadata;
  completedTransferFileShareLink: string;
  handleGenerateTransferFileLink: (
    file: File,
    fileMetadata: FileMetadata,
  ) => void;
  setFile: (file: File | null) => void;
  resetAllStates: () => void;
}

export default function TransferCompleted({
  completedRecipientId,
  file,
  fileMetadata,
  completedTransferFileShareLink,
  handleGenerateTransferFileLink,
  setFile,
  resetAllStates,
}: TransferCompletedProps) {
  const handleStartNewTransfer = () => {
    handleGenerateTransferFileLink(file, fileMetadata);
  };

  const handleSelectDifferentFile = () => {
    setFile(null);
    resetAllStates();
  };

  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold">Transfer Successful</p>
        <p className="text-muted-foreground">
          Your file has been successfully transferred
        </p>
      </div>

      <FileCheck className="h-10 w-10 my-10" />

      <div className="w-full flex flex-col items-center space-y-5">
        <Badge className="p-2 bg-primary/90">
          Recipient ID: {completedRecipientId}
        </Badge>
        <FileCard fileMetadata={fileMetadata} />
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span>Transfer completed</span>
            <span>100%</span>
          </div>
          <Progress value={100} />
        </div>
        <Input
          value={completedTransferFileShareLink}
          className="w-full"
          readOnly
        />
      </div>

      <div className="w-full flex flex-col space-y-3 mt-2">
        <Button onClick={handleStartNewTransfer} className="w-full">
          Start New Transfer
        </Button>
        <Button
          onClick={handleSelectDifferentFile}
          variant="ghost"
          className="w-full"
        >
          Select Different File
        </Button>
      </div>
    </div>
  );
}
