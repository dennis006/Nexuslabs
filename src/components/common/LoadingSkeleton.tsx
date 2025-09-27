import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

export default LoadingSkeleton;
