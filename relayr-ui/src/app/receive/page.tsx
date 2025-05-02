import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import ReceiveClientPage from "./ReceiveClientPage";

export default function ReceiverPage() {
  return (
    <Suspense fallback={<Loader2Icon className="h-10 w-10 animate-spin" />}>
      <ReceiveClientPage />
    </Suspense>
  );
}
