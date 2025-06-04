// React
import { ReactNode } from "react";

// props interface for DevLayout
interface DevLayoutProps {
  children: ReactNode;
}

/**
 * DevLayout component
 * This component serves as a layout wrapper for development-related pages,
 * providing a consistent structure for displaying development content.
 *
 * @param {DevLayoutProps} props - The properties for the DevLayout component.
 * @return JSX.Element - The rendered DevLayout component.
 */
export default function DevLayout({ children }: DevLayoutProps) {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      {children}
    </div>
  );
}
