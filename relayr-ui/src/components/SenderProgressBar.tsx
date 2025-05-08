import { useShallow } from "zustand/shallow";
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { Progress } from "./ui/progress";
import { TextShimmer } from "./motion-primitives/text-shimmer";

export default function SenderProgressBar() {
  const { isTransferring, progress } = useFileSenderStore(
    useShallow((state) => ({
      isTransferring: state.transferStatus.isTransferring,
      progress: state.transferStatus.progress,
    })),
  );

  return (
    <>
      <div className="flex justify-between text-sm">
        <span>
          {isTransferring ? (
            "Transferring file"
          ) : (
            <TextShimmer>Click to start the transfer</TextShimmer>
          )}
        </span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </>
  );
}
