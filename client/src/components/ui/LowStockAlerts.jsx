import { AlertTriangle, CheckCircle2, PackageX } from "lucide-react";

function LowStockAlerts({ products = [] }) {
  const alertProducts = products.filter(
    (product) =>
      product.status === "Low Stock" || product.status === "Out of Stock"
  );

  if (alertProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              All good. No low-stock alerts right now.
            </p>

            <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/80">
              Your inventory stock levels are currently healthy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
        <AlertTriangle size={20} className="text-amber-500 dark:text-amber-300" />
        Stock Alerts
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Products that need attention soon.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {alertProducts.slice(0, 6).map((product) => (
          <div
            key={product._id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950 dark:text-white">
                  {product.name}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  SKU: {product.sku}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.status === "Out of Stock"
                    ? "bg-red-500/10 text-red-600 dark:text-red-300"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                {product.status === "Out of Stock" ? (
                  <span className="flex items-center gap-1">
                    <PackageX size={13} /> Out
                  </span>
                ) : (
                  "Low"
                )}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900">
              <span className="text-slate-500 dark:text-slate-400">
                Current Qty
              </span>

              <span className="font-semibold text-slate-950 dark:text-white">
                {product.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LowStockAlerts;