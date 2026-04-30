import { PackageOpen } from "lucide-react";

function EmptyState({
  title = "No data found",
  message = "There is nothing to show here yet.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-slate-400">
        <PackageOpen size={32} />
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        {message}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;