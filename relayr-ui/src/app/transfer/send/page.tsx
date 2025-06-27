// Next.js
import { Metadata } from "next";

// Internal Components
import LazySendPage from "./LazySendPage";

export const metadata: Metadata = {
  title: "Send File | Relayr",
};

export default function SendPage() {
  return <LazySendPage />;
}
