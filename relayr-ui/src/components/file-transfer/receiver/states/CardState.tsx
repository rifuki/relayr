// React
import { ReactNode } from "react";

// ShadCN UI Components
import { Card, CardContent } from "@/components/ui/card";

// Props interface for CardState component
interface CardStateProps {
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
export default function CardState({ children }: CardStateProps) {
  return (
    <Card className="w-screen max-w-sm sm:max-w-md bg-opacity border-none shadow-none">
      <CardContent className="flex flex-col items-center justify-center space-y-5 min-h-[300px]">
        {children}
      </CardContent>
    </Card>
  );
}
