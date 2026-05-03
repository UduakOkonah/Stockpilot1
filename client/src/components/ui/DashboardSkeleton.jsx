import Skeleton from "./Skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-10 w-28" />
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-56" />

            <div className="mt-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-2 h-3 w-64" />

        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-16 w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;