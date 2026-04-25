import { TrendingUp } from "lucide-react";

function RestockSuggestions({ products, transactions }) {
  const suggestions = products
    .map((product) => {
      const totalSold = transactions
        .filter(
          (t) => t.productName === product.name && t.type === "OUT"
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
        (p.totalSold > 20 && p.quantity < p.reorderLevel)
    )
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <TrendingUp size={18} className="text-cyan-300" />
        Restock Suggestions
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Based on sales activity and stock levels.
      </p>

      <div className="mt-5 space-y-3">
        {suggestions.map((product) => (
          <div
            key={product._id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <div>
              <p className="font-medium text-white">{product.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Sold: {product.totalSold} · Qty: {product.quantity}
              </p>
            </div>

            <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
              Restock
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestockSuggestions;