function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>

        <h2 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
          StockPilot
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Loading your workspace...
        </p>
      </div>
    </div>
  );
}

export default PageLoader;