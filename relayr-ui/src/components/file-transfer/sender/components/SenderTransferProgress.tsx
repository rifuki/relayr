// External Libraries
import { motion } from "motion/react";

// ShadCN UI Components
import { Progress } from "@/components/ui/progress";

// Motion-Primitives UI Components
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";

// Internal Components
import TransferStatusText from "../../commons/TransferStatusText";

// Constants and variants for animation durations and motion variants
import { fileListItemVariants } from "@/lib/animations";

// Utilities
import { formatFileSize } from "@/utils/file";

// State Management (Store)
import { useFileSenderStore } from "@/stores/useFileSenderStore";

/**
 * TransferSenderProgress component displays the progress of a file transfer
 * from the sender's perspective, including the transferred amount, total size,
 * and receiver's progress percentage.
 *
 * @returns JSX.Element The rendered component.
 */
export default function TransferSenderProgress() {
  // Retrieve total file size from store
  const { size: fileSize } = useFileSenderStore((state) => state.fileMetadata!);

  // Retrieve current offset, transfer status flags
  const { offset, isTransferring, isTransferError, isTransferCompleted } =
    useFileSenderStore((state) => state.transferStatus);

  // Retrieve receiver progress percentage
  const { receiver: receiverProgress } = useFileSenderStore(
    (state) => state.transferProgress,
  );

  // Format the transferred value and total size label
  const { value: transferredValue, unit: transferredUnit } =
    formatFileSize(offset);
  // Format the total file size for display
  const totalSizeLabel = formatFileSize(fileSize).formatted;

  return (
    <motion.div variants={fileListItemVariants} className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        {/* Display the current transfer status */}
        <TransferStatusText
          isTransferring={isTransferring}
          isError={isTransferError}
          isCompleted={isTransferCompleted}
          transferredValue={transferredValue}
          transferredUnit={transferredUnit}
          totalSizeLabel={totalSizeLabel}
          idleText="Click to start transfer"
        />
        {/* Show receiver progress in percentage */}
        <span className="inline-flex items-center">
          <SlidingNumber value={receiverProgress} />%
        </span>
      </div>

      {/* Progress bar showing receiver's progress */}
      <Progress value={receiverProgress} />
    </motion.div>
  );
}
