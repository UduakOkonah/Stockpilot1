function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 break-words text-2xl font-bold text-slate-950 dark:text-white">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

export default StatCard;