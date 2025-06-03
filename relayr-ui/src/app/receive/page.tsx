// React
import { Suspense } from "react";

// Custom Components
import ExperienceLoading from "@/components/loading/ExperienceLoading";

// Internal Components
import ReceivePageContent from "./ReceivePageContent";

/**
 * File Transfer Page for the Seceiver
 * This component serves as the main entry point for the file receiver page,
 * wrapping the ReceivePageContent in a Suspense boundary
 * to handle loading states.
 *
 * @returns JSX.Element The receiver page content wrapped in a Suspense boundary.
 *
 */
export default function ReceiverPage() {
  return (
    <Suspense fallback={<ExperienceLoading />}>
      <ReceivePageContent />
    </Suspense>
  );
}
