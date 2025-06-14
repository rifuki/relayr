// React
import { ReactNode } from "react";

// ShadCN UI Components
import { Card } from "@/components/ui/card";

// Tailwind Utility function for conditional class names
import { cn } from "@/lib/utils";

// Props interface for CardState component
interface CardStateProps {
  className?: string;
  children: ReactNode;
}

/**
 * CardState Component
 * This component serves as a wrapper for displaying content in a card format.
 * It is designed to be used in various states of an application, providing a consistent layout.
 *
 * @param {CardStateProps} props - The properties for the CardState component.
 * @returns JSX.Element The rendered CardState component.
 */
export default function CardState({ className, children }: CardStateProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-xs bg-opacity border-none shadow-none flex flex-col items-center justify-center space-y-5 gap-0",
        className,
      )}
      style={{ minHeight: "300px" }}
    >
      {children}
    </Card>
  );
}
