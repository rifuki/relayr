import { ReactNode } from "react";

interface TransferLayoutProps {
  children: ReactNode;
}

export default function TransferLayout({ children }: TransferLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
      {children}
    </div>
  );
}
