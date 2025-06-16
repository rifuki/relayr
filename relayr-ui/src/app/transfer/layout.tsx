// React
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      {children}
    </div>
  );
}
