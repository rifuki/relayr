import { useShallow } from "zustand/shallow";
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { TextShimmer } from "./motion-primitives/text-shimmer";
import { formatFileSize } from "@/lib/utils";
import { motion } from "motion/react";
import { fileListItemVariants } from "@/lib/animations";

export default function SenderProgressBar() {
  const {
    isTransferring,
    isRecipientComplete,
    progress,
    uploadedSize,
    totalSize,
  } = useFileSenderStore(
    useShallow((state) => ({
      isTransferring: state.transferStatus.isTransferring,
      progress: state.transferStatus.progress,
      isRecipientComplete: state.transferStatus.isRecipientComplete,
      uploadedSize: state.transferStatus.uploadedSize,
      totalSize: state.transferStatus.totalSize,
    })),
  );

  return (
    <motion.div variants={fileListItemVariants} className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          {isTransferring ? (
            `${formatFileSize(uploadedSize)} / ${formatFileSize(totalSize)}`
          ) : isRecipientComplete ? (
            "Transfer Completed"
          ) : (
            <TextShimmer>Click to start the transfer</TextShimmer>
          )}
        </span>
        <span>{progress}%</span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
        {/* Background progress bar with transition */}
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />

        {/* Wave effect overlay - only visible during transfer */}
        {isTransferring && (
          <div className="absolute inset-0 w-full overflow-hidden">
            <div className="wave-effect">
              <style jsx>{`
                @keyframes wave {
                  0% {
                    transform: translateX(-100%);
                  }
                  50% {
                    transform: translateX(0%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }
                .wave-effect {
                  height: 100%;
                  width: 100%;
                  position: absolute;
                  top: 0;
                  left: 0;
                  background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent
                  );
                  animation: wave 2s linear infinite;
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
