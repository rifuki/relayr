// React
import { ReactNode } from "react";

// External Libraries
import { Loader2Icon } from "lucide-react";
import { motion, Variants } from "motion/react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Internal Components
import TransferFileCard from "./TransferFileCard";
import ShareableLinkInput from "@/components/ShareableLinkInput";

// Tailwind CSS Utility Function
import { cn } from "@/lib/utils";

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

// Types
import { FileMetadata } from "@/types/file";

interface StepInfoSectionProps {
  fileMetadata?: FileMetadata;
  idLabel?: "Recipient" | "Sender";
  idValue?: string;
  transferShareLink?: string;
  transferShareLinkDisabled?: boolean;
  customFileCard?: ReactNode;
  containerClassName?: string;
  motionVariants?: Variants;
}

export default function StepInfoSection({
  fileMetadata,
  idLabel,
  idValue,
  transferShareLink,
  transferShareLinkDisabled,
  customFileCard,
  containerClassName,
  motionVariants = fileListItemVariants,
}: StepInfoSectionProps) {
  return (
    <motion.div
      className={cn("w-full flex flex-col items-center bg-green-500", containerClassName)}
      variants={motionVariants}
    >
      {/* Display ID Label and Value if provided */}
      {idLabel &&
        (idValue ? (
          <Badge className="p-2 bg-primary/90">
            {idLabel} ID: {idValue}
          </Badge>
        ) : (
          <Badge className="p-2 bg-primary/90">
            {idLabel} ID: <Loader2Icon className="animate-spin" />
          </Badge>
        ))}

      {/* Transfer Share Link Input */}
      {transferShareLink && (
        <ShareableLinkInput
          text={transferShareLink}
          disabled={transferShareLinkDisabled}
        />
      )}
      {/* Custom File Card or Default Transfer File Card */}
      {customFileCard || !fileMetadata ? (
        customFileCard
      ) : (
        <TransferFileCard fileMetadata={fileMetadata} />
      )}
    </motion.div>
  );
}
