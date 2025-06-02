export default function SkeletonLoading() {
  return (
    <div className="w-screen max-w-sm sm:max-w-md">
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 px-6 shadow-sm">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-48 bg-secondary/60 rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-secondary/40 rounded-md animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="h-32 w-full bg-secondary/30 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-secondary/40 rounded-full animate-pulse" />
            <div className="h-2 w-3/4 bg-secondary/30 rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-full bg-secondary/50 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
