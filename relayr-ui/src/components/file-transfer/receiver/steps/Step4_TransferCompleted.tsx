import { FileCheckIcon } from "lucide-react";
import { motion } from "motion/react";

import { MotionButton } from "@/components/motion-primitives/motion-button";
import { Badge } from "@/components/ui/badge";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";
import {
  ReceiverTransferProgress,
  TransferFileCard,
  TransferHeader,
} from "../../shared";

const burstAnimation = {
  scale: [1, 2, 0],
  opacity: [1, 0.8, 0],
  transition: {
    duration: 1.5,
    ease: "easeOut",
  },
};

const successAnimation = {
  scale: [0, 1.5, 1],
  opacity: [0, 1],
  transition: {
    duration: 1.5,
    ease: "easeOut",
  },
};

export default function Step4_TransferCompleted() {
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const fileUrl = useFileReceiverStore((state) => state.fileUrl);

  if (!senderId || !fileMetadata || !fileUrl) return;

  const handleDownloadFile = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileMetadata.name || "downloaded-file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Transfer Completed"
        description="The file has been successfully received"
      />

      <motion.div
        className="relative flex justify-center items-center my-10 mb-15"
        variants={fileListItemVariants}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          initial={{ scale: 0, opacity: 0 }}
          animate={burstAnimation}
        />
        <motion.div
          className="relative z-1"
          initial={{ scale: 0, opacity: 0 }}
          animate={successAnimation}
        >
          <div className="bg-green-500 rounded-full p-4">
            <FileCheckIcon className="h-10 w-10 text-white" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Sender ID: {senderId}</Badge>
        <TransferFileCard fileMetadata={fileMetadata} />
      </motion.div>

      <ReceiverTransferProgress />

      <motion.div
        onClick={handleDownloadFile}
        className="w-full flex flex-col space-y-5"
        variants={fileListItemVariants}
      >
        <MotionButton>Download</MotionButton>
      </motion.div>
    </motion.div>
  );
}
