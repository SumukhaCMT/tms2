import {

  Skeleton
} from "@/components/ui/skeleton";


export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 p-4 md:p-6">

      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Chart Skeleton */}
        <div className="rounded-xl border p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-62.5 w-full" />
        </div>

        {/* Activity Skeleton */}
        <div className="rounded-xl border p-5 space-y-4">
          <Skeleton className="h-5 w-32" />

          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <Skeleton className="size-10 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border p-5 space-y-4">
        <Skeleton className="h-5 w-40" />

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4"
          >
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

    </div>
  )
}