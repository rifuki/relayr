// React
import { Suspense } from "react";

// Custom Components
import ExperienceLoading from "@/components/loading/ExperienceLoading";
import ReceivePageContent from "./ReceivePageContent";

export default function ReceiverPageContent() {
  return (
    <Suspense fallback={<ExperienceLoading />}>
      <ReceivePageContent />
    </Suspense>
  );
}
