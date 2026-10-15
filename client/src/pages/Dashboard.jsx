import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Package,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard";
import ProductTable from "../components/ui/ProductTable";
import LowStockAlerts from "../components/ui/LowStockAlerts";
import SmartInsights from "../components/ui/SmartInsights";
import RestockSuggestions from "../components/ui/RestockSuggestions";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";
import EmptyState from "../components/ui/EmptyState";

import useSettings from "../hooks/useSettings";
import { getProducts } from "../services/productService";
import { getActivities } from "../services/activityService";
import { getDashboardSummary } from "../services/dashboardService";
import { getTransactions } from "../services/transactionService";

const cardClasses =
  "min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-5";

const titleClasses =
  "text-base font-semibold text-slate-950 dark:text-white";

const subtitleClasses =
  "mt-1 text-xs text-slate-500 dark:text-slate-400";

const chartGridColor = "#cbd5e1";
const chartAxisColor = "#64748b";

const tooltipStyle = {
  backgroundColor: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  color: "#e5e7eb",
  fontSize: "12px",
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-NG").format(Number(value) || 0);

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.activities)) return data.activities;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function ChartBox({ children }) {
  return (
    <div className="relative h-[280px] w-full min-w-0">
      {children}
    </div>
  );
}

function getActionClasses(action) {
  if (action === "CREATE") {
    return "bg-green-500/15 text-green-600 dark:text-green-300";
  }

  if (action === "UPDATE") {
    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  }

  return "bg-red-500/15 text-red-600 dark:text-red-300";
}

function formatActivityDate(date) {
  if (!date) return "Date unavailable";

  const activityDate = new Date(date);

  if (Number.isNaN(activityDate.getTime())) {
    return "Date unavailable";
  }

  return `${activityDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${activityDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getTransactionQuantity(transaction) {
  return Number(transaction?.quantity) || 0;
}

function getTransactionDateKey(transaction) {
  const date = new Date(transaction?.createdAt);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

function formatChartDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function Dashboard() {
  const { settings } = useSettings();

  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);

      try {
        const [
          productResponse,
          activityResponse,
          summaryResponse,
          transactionResponse,
        ] = await Promise.all([
          getProducts(),
          getActivities(),
          getDashboardSummary(),
          getTransactions(),
        ]);

        if (!isMounted) return;

        setProducts(getArray(productResponse));
        setActivities(getArray(activityResponse));
        setTransactions(getArray(transactionResponse));
        setSummary(summaryResponse?.data ?? summaryResponse ?? {});
        setError("");
      } catch (err) {
        console.error("Failed to load dashboard data:", err);

        if (isMounted) {
          setError(
            "Unable to load your dashboard data. Please refresh the page and try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentProducts = useMemo(
    () => products.slice(0, 6),
    [products]
  );

  const stockMovementData = useMemo(() => {
    const totals = transactions.reduce(
      (result, transaction) => {
        const quantity = getTransactionQuantity(transaction);

        if (transaction?.type === "IN") {
          result.stockIn += quantity;
        } else if (transaction?.type === "OUT") {
          result.stockOut += quantity;
        }

        return result;
      },
      { stockIn: 0, stockOut: 0 }
    );

    return [
      { name: "Stock In", quantity: totals.stockIn },
      { name: "Stock Out", quantity: totals.stockOut },
    ];
  }, [transactions]);

  const revenueData = useMemo(() => {
    const dailyRevenue = {};

    transactions.forEach((transaction) => {
      if (transaction?.type !== "OUT") return;

      const dateKey = getTransactionDateKey(transaction);
      if (!dateKey) return;

      const revenue = Number(transaction?.totalValue) || 0;

      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + revenue;
    });

    return Object.keys(dailyRevenue)
      .sort()
      .map((dateKey) => ({
        date: formatChartDate(dateKey),
        revenue: dailyRevenue[dateKey],
      }));
  }, [transactions]);

  const profitData = useMemo(() => {
    const dailyProfit = {};

    transactions.forEach((transaction) => {
      if (transaction?.type !== "OUT") return;

      const dateKey = getTransactionDateKey(transaction);
      if (!dateKey) return;

      const profit = Number(transaction?.profit) || 0;

      dailyProfit[dateKey] = (dailyProfit[dateKey] || 0) + profit;
    });

    return Object.keys(dailyProfit)
      .sort()
      .map((dateKey) => ({
        date: formatChartDate(dateKey),
        profit: dailyProfit[dateKey],
      }));
  }, [transactions]);

  const bestSellingProducts = Array.isArray(summary?.bestSellingProducts)
    ? summary.bestSellingProducts
    : [];

  const mostProfitableProducts = Array.isArray(
    summary?.mostProfitableProducts
  )
    ? summary.mostProfitableProducts
    : [];

  return (
    <AppLayout>
      <section className="min-w-0">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            Inventory Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 sm:text-base">
            Track stock, monitor inventory health, sales performance, and
            profit.
          </p>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Products"
                value={formatNumber(summary?.totalProducts)}
                description="Products in your inventory"
                icon={Package}
                iconClass="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
              />

              <StatCard
                title="Total Stock Units"
                value={formatNumber(summary?.totalStockUnits)}
                description="Combined quantity in stock"
                icon={Boxes}
                iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
              />

              <StatCard
                title="Monthly Revenue"
                value={formatMoney(summary?.monthlyRevenue)}
                description="Revenue in the last 30 days"
                icon={Wallet}
                iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              />

              <StatCard
                title="Monthly Profit"
                value={formatMoney(summary?.monthlyProfit)}
                description="Profit in the last 30 days"
                icon={TrendingUp}
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              />
            </div>

            {/* Inventory health */}
            {settings?.lowStockAlerts && (
              <div className="mt-8">
                <LowStockAlerts products={products} />
              </div>
            )}

            {/* Smart inventory features */}
            <div className="mt-8">
              <SmartInsights
                products={products}
                transactions={transactions}
              />
            </div>

            <div className="mt-8">
              <RestockSuggestions
                products={products}
                transactions={transactions}
              />
            </div>

            {/* Charts and product insights */}
            <div className="mt-8 grid min-w-0 gap-5 xl:grid-cols-2">
              {/* Stock movement */}
              <div className={cardClasses}>
                <div className="mb-4">
                  <h2 className={titleClasses}>Stock Movement</h2>
                  <p className={subtitleClasses}>
                    Stock-in compared with stock-out.
                  </p>
                </div>

                <ChartBox>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockMovementData} barSize={36}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartGridColor}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        stroke={chartAxisColor}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        stroke={chartAxisColor}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        cursor={{ fill: "#f1f5f9" }}
                        contentStyle={tooltipStyle}
                      />

                      <Bar
                        dataKey="quantity"
                        name="Units"
                        fill="#06b6d4"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
              </div>

              {/* Best sellers */}
              <div className={cardClasses}>
                <div className="mb-4">
                  <h2 className={titleClasses}>Best Selling Products</h2>
                  <p className={subtitleClasses}>
                    Top products by units sold.
                  </p>
                </div>

                {bestSellingProducts.length === 0 ? (
                  <EmptyState
                    title="No sales data yet"
                    message="Best selling products will appear after sales are recorded."
                  />
                ) : (
                  <ChartBox>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bestSellingProducts} barSize={28}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartGridColor}
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          stroke={chartAxisColor}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          stroke={chartAxisColor}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />

                        <Tooltip
                          cursor={{ fill: "#f1f5f9" }}
                          contentStyle={tooltipStyle}
                        />

                        <Bar
                          dataKey="quantity"
                          name="Units sold"
                          fill="#8b5cf6"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartBox>
                )}
              </div>

              {/* Revenue trend */}
              <div className={`${cardClasses} xl:col-span-2`}>
                <div className="mb-4">
                  <h2 className={titleClasses}>Revenue Trend</h2>
                  <p className={subtitleClasses}>
                    Revenue recorded from stock-out transactions.
                  </p>
                </div>

                {revenueData.length === 0 ? (
                  <EmptyState
                    title="No revenue data yet"
                    message="Revenue trends will appear after sales are recorded."
                  />
                ) : (
                  <ChartBox>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartGridColor}
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          stroke={chartAxisColor}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          stroke={chartAxisColor}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            value >= 1000
                              ? `₦${(value / 1000).toFixed(0)}k`
                              : `₦${value}`
                          }
                        />

                        <Tooltip
                          cursor={{ stroke: "#334155" }}
                          contentStyle={tooltipStyle}
                          formatter={(value) => [
                            formatMoney(value),
                            "Revenue",
                          ]}
                        />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#06b6d4" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartBox>
                )}
              </div>

              {/* Profit trend */}
              <div className={`${cardClasses} xl:col-span-2`}>
                <div className="mb-4">
                  <h2 className={titleClasses}>Profit Trend</h2>
                  <p className={subtitleClasses}>
                    Profit recorded from completed sales.
                  </p>
                </div>

                {profitData.length === 0 ? (
                  <EmptyState
                    title="No profit data yet"
                    message="Profit trends will appear after sales are recorded."
                  />
                ) : (
                  <ChartBox>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={profitData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartGridColor}
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          stroke={chartAxisColor}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          stroke={chartAxisColor}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            value >= 1000
                              ? `₦${(value / 1000).toFixed(0)}k`
                              : `₦${value}`
                          }
                        />

                        <Tooltip
                          cursor={{ stroke: "#334155" }}
                          contentStyle={tooltipStyle}
                          formatter={(value) => [
                            formatMoney(value),
                            "Profit",
                          ]}
                        />

                        <Line
                          type="monotone"
                          dataKey="profit"
                          name="Profit"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#22c55e" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartBox>
                )}
              </div>

              {/* Most profitable products */}
              <div className={cardClasses}>
                <div className="mb-4">
                  <h2 className={titleClasses}>Most Profitable Products</h2>
                  <p className={subtitleClasses}>
                    Products bringing in the highest profit.
                  </p>
                </div>

                <div className="space-y-3">
                  {mostProfitableProducts.length === 0 ? (
                    <EmptyState
                      title="No profit records"
                      message="Profitable products will appear after sales are recorded."
                    />
                  ) : (
                    mostProfitableProducts.map((product, index) => (
                      <div
                        key={product._id || product.id || product.name || index}
                        className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-slate-950 dark:text-white">
                            {index + 1}. {product.name || "Unnamed product"}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Profit generated
                          </p>
                        </div>

                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatMoney(product.profit)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Products overview */}
              <div className={cardClasses}>
                <div className="mb-4">
                  <h2 className={titleClasses}>Products Overview</h2>
                  <p className={subtitleClasses}>
                    Quick view of your inventory.
                  </p>
                </div>

                {recentProducts.length === 0 ? (
                  <EmptyState
                    title="No products yet"
                    message="Add products to see your inventory overview here."
                  />
                ) : (
                  <ProductTable products={recentProducts} />
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                Recent Activity
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">
                Latest inventory actions across your system.
              </p>

              <div className="mt-6 space-y-4">
                {activities.length === 0 ? (
                  <EmptyState
                    title="No recent activity"
                    message="Inventory updates, product changes, and sales activity will appear here."
                  />
                ) : (
                  activities.map((activity, index) => (
                    <div
                      key={activity._id || activity.id || index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getActionClasses(
                                activity.action
                              )}`}
                            >
                              {activity.action || "ACTIVITY"}
                            </span>

                            <p className="break-words text-sm font-semibold text-slate-950 dark:text-white">
                              {activity.productName || "Inventory update"}
                            </p>
                          </div>

                          <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">
                            {activity.change || "No additional details."}
                          </p>

                          <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                            SKU: {activity.sku || "N/A"}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          {formatActivityDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
}

export default Dashboard;