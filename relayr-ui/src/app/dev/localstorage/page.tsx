"use client";

// Next.js
import dynamic from "next/dynamic";

// Custom Components
import ExperienceLoading from "@/components/loading/ExperienceLoading";

// Lazy-loaded Internal Components
const LocalStorage = dynamic(() => import("./LocalStorage"), {
  loading: () => <ExperienceLoading />,
  ssr: false,
});

export default function ResetLocalStoragePage() {
  return <LocalStorage />;
}
