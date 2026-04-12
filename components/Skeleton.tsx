interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-800 rounded ${className}`} />
  );
}

export function MessageCardSkeleton() {
  return (
    <div className="p-4 border border-gray-800 rounded-xl">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}