// Next.js
import { Metadata } from "next";

// Internal Components
import LazyReceivePage from "./LazyReceivePage";

export const metadata: Metadata = {
  title: "Receive File | Relayr",
}

export default function ReceivePage() {
  return <LazyReceivePage />;
}
