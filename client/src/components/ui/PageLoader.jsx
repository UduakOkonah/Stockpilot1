import { PackageCheck } from "lucide-react";

function PageLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 dark:bg-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute right-10 top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-white shadow-xl dark:bg-slate-900">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950">
              <PackageCheck size={30} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            StockPilot
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">
            Loading your workspace...
          </p>
        </div>

        <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-500" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Smart Inventory System
        </p>
      </div>
    </div>
  );
}

export default PageLoader;