"use client";

// Next.js
import dynamic from "next/dynamic";

// Custom Components
import ExperienceLoading from "@/components/loading/ExperienceLoading";

// Lazy-loaded Internal Components
const Receive = dynamic(() => import("./Receive"), {
  loading: () => <ExperienceLoading />,
  ssr: false,
});

export default function ReceivePage() {
  return <Receive />;
}
