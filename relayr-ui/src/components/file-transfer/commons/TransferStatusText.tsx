// Motion-Primitives UI Components
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// Props for TransferStatusText component
interface TransferStatusTextProps {
  isTransferring: boolean;
  isError: boolean;
  isCompleted: boolean;
  transferredValue: number;
  transferredUnit: string;
  totalSizeLabel: string;
  idleText: string;
}

/**
 * TransferStatusText component displays the status of a transfer operation.
 * It shows different messages based on the transfer state
 *
 * @param {TransferStatusTextProps} props - The properties for the component.
 * @returns JSX.Element The rendered component.
 */
export default function TransferStatusText({
  isTransferring,
  isError,
  isCompleted,
  transferredValue,
  transferredUnit,
  totalSizeLabel,
  idleText,
}: TransferStatusTextProps) {
  if (isCompleted) return <TextShimmer>Transfer Completed</TextShimmer>;

  if (isError)
    return <span className="text-destructive">Error during transfer</span>;

  if (isTransferring)
    <span>
      <AnimatedNumber
        springOptions={{
          bounce: 0.25,
          duration: 100,
        }}
        value={transferredValue}
      />{" "}
      {transferredUnit} of {totalSizeLabel}
    </span>;

  return <TextShimmer>{idleText}</TextShimmer>;
}
