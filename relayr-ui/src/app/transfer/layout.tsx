// React
import { ReactNode } from "react";

// Props interface TransferCardLayoutProps
interface TransferLayoutProps {
  children: ReactNode;
}

/**
 * TransferLayout component
 * This component serves as a layout wrapper for transfer-related pages,
 * providing a consistent structure for displaying transfer content.
 *
 * @param {TransferLayoutProps} props - The properties for the TransferLayout component.
 * @return JSX.Element - The rendered TransferLayout component.
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
