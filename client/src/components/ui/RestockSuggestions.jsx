import {
  CheckCircle2,
  PackagePlus,
  TrendingUp,
} from "lucide-react";

function RestockSuggestions({
  products = [],
  transactions = [],
}) {
  const suggestions = products
    .map((product) => {
      const totalSold = transactions
        .filter(
          (t) =>
            t.productName === product.name &&
            t.type === "OUT"
        )
        .reduce((sum, t) => sum + t.quantity, 0);

      return {
        ...product,
        totalSold,
      };
    })
    .filter(
      (p) =>
        p.status === "Low Stock" ||
        (p.totalSold > 20 &&
          p.quantity < p.reorderLevel)
    )
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              No urgent restocking needed.
            </p>

            <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/80">
              Your current inventory levels look stable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
        <TrendingUp
          size={18}
          className="text-cyan-600 dark:text-cyan-300"
        />
        Restock Suggestions
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">
        Based on sales activity and current stock levels.
      </p>

      <div className="mt-5 space-y-3">
        {suggestions.map((product) => (
          <div
            key={product._id}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">
                {product.name}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:bg-slate-900 dark:text-slate-300">
                  Sold: {product.totalSold}
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:bg-slate-900 dark:text-slate-300">
                  Qty: {product.quantity}
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:bg-slate-900 dark:text-slate-300">
                  Reorder: {product.reorderLevel}
                </span>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
              <PackagePlus size={14} />
              Restock
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestockSuggestions;