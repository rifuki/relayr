// External Library
import { Loader2Icon } from "lucide-react";

/**
 * ExperienceLoading Component
 * Displays a loading state with an animated icon and text.
 *
 * @returns JSX.Element The loading component.
 */
export default function ExperienceLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-112 gap-4 -mt-12">
      {/* Loader Icon */}
      <span className="rounded-full bg-muted p-3 shadow-lg animate-pulse">
        <Loader2Icon className="h-12 w-12 text-primary animate-spin" />
      </span>

      {/* Loading Text */}
      <p className="text-muted-foreground text-base font-medium tracking-wide animate-fade-in">
        Preparing your experience...
      </p>
    </div>
  );
}
