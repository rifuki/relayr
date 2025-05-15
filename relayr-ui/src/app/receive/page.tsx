import { Suspense } from "react";

import { LoaderIcon } from "lucide-react";

import ReceivePageContent from "./ReceivePageContent";

export default function ReceiverPageContent() {
  return (
    <Suspense fallback={<LoaderIcon className="h-15 w-15 animate-spin" />}>
      <ReceivePageContent />
    </Suspense>
  );
}
