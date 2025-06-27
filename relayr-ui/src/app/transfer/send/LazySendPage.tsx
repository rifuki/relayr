"use client";

// Next.js
import dynamic from "next/dynamic";

// Custom Components
import ExperienceLoading from "@/components/loading/ExperienceLoading";

// Lazy-loaded Internal Components
const Send = dynamic(() => import("./Send"), {
  loading: () => <ExperienceLoading />,
  ssr: false,
});

export default function LazySendPage() {
  return <Send />;
}
