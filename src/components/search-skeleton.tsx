import { Skeleton } from "@/components/ui/skeleton";

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-[9/16]" />
        <Skeleton className="aspect-[9/16]" />
        <Skeleton className="aspect-[9/16]" />
      </div>
    </div>
  );
}
