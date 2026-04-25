import { AlertTriangle, PackageX } from "lucide-react";

function LowStockAlerts({ products }) {
  const alertProducts = products.filter(
    (product) =>
      product.status === "Low Stock" || product.status === "Out of Stock"
  );

  if (alertProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
        <p className="text-sm font-medium text-green-300">
          All good. No low-stock alerts right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <AlertTriangle size={20} className="text-amber-300" />
        Stock Alerts
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Products that need attention soon.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {alertProducts.slice(0, 6).map((product) => (
          <div
            key={product._id}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  SKU: {product.sku}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.status === "Out of Stock"
                    ? "bg-red-500/15 text-red-300"
                    : "bg-amber-500/15 text-amber-300"
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

            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-sm">
              <span className="text-slate-400">Current Qty</span>
              <span className="font-semibold text-white">
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