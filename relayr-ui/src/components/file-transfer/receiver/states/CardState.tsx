import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface CardStateProps {
  children: ReactNode;
}
export default function CardState({ children }: CardStateProps) {
  return (
    <Card className="w-screen max-w-sm sm:max-w-md">
      <CardContent className="flex flex-col items-center justify-center space-y-5 min-h-[300px]">
        {children}
      </CardContent>
    </Card>
  );
}
