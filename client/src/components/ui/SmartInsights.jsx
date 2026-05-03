import { Brain, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

function SmartInsights({ products, transactions }) {
  const lowStockCount = products.filter(
    (product) => product.status === "Low Stock"
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.status === "Out of Stock"
  ).length;

  const stockInTotal = transactions
    .filter((transaction) => transaction.type === "IN")
    .reduce((sum, transaction) => sum + transaction.quantity, 0);

  const stockOutTotal = transactions
    .filter((transaction) => transaction.type === "OUT")
    .reduce((sum, transaction) => sum + transaction.quantity, 0);

  const movementMap = {};

  transactions.forEach((transaction) => {
    movementMap[transaction.productName] =
      (movementMap[transaction.productName] || 0) + transaction.quantity;
  });

  const mostMovedProduct =
    Object.entries(movementMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No movement yet";

  const insights = [
    {
      icon: Brain,
      title: "Most Active Product",
      value: mostMovedProduct,
      description: "Based on total stock movement.",
    },
    {
      icon: AlertCircle,
      title: "Inventory Risk",
      value: `${lowStockCount + outOfStockCount} item(s)`,
      description: "Products needing attention.",
    },
    {
      icon: TrendingUp,
      title: "Stock In",
      value: stockInTotal,
      description: "Total units added.",
    },
    {
      icon: TrendingDown,
      title: "Stock Out",
      value: stockOutTotal,
      description: "Total units removed.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
        Smart Insights
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Quick inventory signals based on your current records.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <div
              key={insight.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-3 inline-flex rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-300">
                <Icon size={18} />
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                {insight.title}
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                {insight.value}
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {insight.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SmartInsights;