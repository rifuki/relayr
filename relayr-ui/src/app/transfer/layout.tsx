// React
import { ReactNode } from "react";

// Props interface TransferCardLayoutProps
interface TransferLayoutProps {
  children: ReactNode;
}

/**
 * TransferLayout component provides a full-width layout for file transfer operations.
 * It centers its children vertically and horizontally within the viewport.
 *
 * @param {TransferLayoutProps} props - Component props containing children elements.
 * @returns JSX.Element - A div that serves as a layout container for transfer operations.
 */
export default function TransferLayout({ children }: TransferLayoutProps) {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      {children}
    </div>
  );
}
