import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/ui/StatCard.jsx";
import ProductTable from "../components/ui/ProductTable";
import { getProducts } from "../services/productService";
import { getActivities } from "../services/activityService";
import { getDashboardSummary } from "../services/dashboardService";
import { getTransactions } from "../services/transactionService";
import LowStockAlerts from "../components/ui/LowStockAlerts";
import SmartInsights from "../components/ui/SmartInsights";
import RestockSuggestions from "../components/ui/RestockSuggestions";
import useSettings from "../hooks/useSettings";

const getActionClasses = (action) => {
  if (action === "CREATE") return "bg-green-500/15 text-green-300";
  if (action === "UPDATE") return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
};

const formatActivityDate = (date) => {
  const activityDate = new Date(date);

  return `${activityDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${activityDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

function Dashboard() {
  const { settings } = useSettings();

  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [productData, activityData, summaryData, transactionData] =
          await Promise.all([
            getProducts(),
            getActivities(),
            getDashboardSummary(),
            getTransactions(),
          ]);

        if (isMounted) {
          setProducts(productData);
          setActivities(activityData);
          setSummary(summaryData);
          setTransactions(transactionData);
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentProducts = useMemo(() => products.slice(0, 6), [products]);

  const stockMovementData = useMemo(() => {
    const stockIn = transactions
      .filter((transaction) => transaction.type === "IN")
      .reduce((sum, transaction) => sum + transaction.quantity, 0);

    const stockOut = transactions
      .filter((transaction) => transaction.type === "OUT")
      .reduce((sum, transaction) => sum + transaction.quantity, 0);

    return [
      { name: "Stock In", quantity: stockIn },
      { name: "Stock Out", quantity: stockOut },
    ];
  }, [transactions]);

  const topMovedProducts = useMemo(() => {
    const productMap = {};

    transactions.forEach((transaction) => {
      if (!productMap[transaction.productName]) {
        productMap[transaction.productName] = 0;
      }

      productMap[transaction.productName] += transaction.quantity;
    });

    return Object.entries(productMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [transactions]);

  const revenueData = useMemo(() => {
    const dailyRevenue = {};

    transactions
      .filter((transaction) => transaction.type === "OUT")
      .forEach((transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        dailyRevenue[date] =
          (dailyRevenue[date] || 0) + (transaction.totalValue || 0);
      });

    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [transactions]);

  const profitData = useMemo(() => {
    const dailyProfit = {};

    transactions
      .filter((transaction) => transaction.type === "OUT")
      .forEach((transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        dailyProfit[date] =
          (dailyProfit[date] || 0) + (transaction.profit || 0);
      });

    return Object.entries(dailyProfit).map(([date, profit]) => ({
      date,
      profit,
    }));
  }, [transactions]);

  return (
    <AppLayout>
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Inventory Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Track stock, monitor inventory health, and manage products.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading dashboard...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <StatCard
                title="Total Products"
                value={summary?.totalProducts || 0}
                subtitle="All inventory items"
              />
              <StatCard
                title="Total Stock Units"
                value={summary?.totalStockUnits || 0}
                subtitle="Combined quantity in stock"
              />
              <StatCard
                title="Low Stock Items"
                value={summary?.lowStockItems || 0}
                subtitle="Need attention soon"
              />
              <StatCard
                title="Out of Stock"
                value={summary?.outOfStockItems || 0}
                subtitle="Currently unavailable items"
              />
              <StatCard
                title="Total Revenue"
                value={`₦${summary?.totalRevenue?.toLocaleString() || 0}`}
                subtitle="Estimated sales value"
              />
              <StatCard
                title="Total Profit"
                value={`₦${summary?.totalProfit?.toLocaleString() || 0}`}
                subtitle="Estimated profit from sales"
              />
            </div>

            {settings?.lowStockAlerts && (
              <div className="mt-8">
                <LowStockAlerts products={products} />
              </div>
            )}

            <div className="mt-8">
              <SmartInsights products={products} transactions={transactions} />
            </div>

            <div className="mt-8">
              <RestockSuggestions
                products={products}
                transactions={transactions}
              />
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-white">
                    Stock Movement
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Stock-in compared with stock-out.
                  </p>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockMovementData} barSize={36}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#0f172a" }}
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          color: "#e5e7eb",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="quantity"
                        fill="#7dd3fc"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-white">
                    Most Moved Products
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Top products by total movement.
                  </p>
                </div>

                <div className="h-56">
                  {topMovedProducts.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
                      No movement data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topMovedProducts} barSize={28}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#0f172a" }}
                          contentStyle={{
                            backgroundColor: "#020617",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#e5e7eb",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="quantity"
                          fill="#c084fc"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4 xl:col-span-2">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-white">
                    Revenue Trend
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Estimated revenue from stock-out transactions.
                  </p>
                </div>

                <div className="h-56">
                  {revenueData.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
                      No revenue data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ stroke: "#334155" }}
                          contentStyle={{
                            backgroundColor: "#020617",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#e5e7eb",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [
                            `₦${value.toLocaleString()}`,
                            "Revenue",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#22d3ee"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#22d3ee" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-slate-900/80 p-4 xl:col-span-2">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-white">
                    Profit Trend
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Estimated profit from completed sales.
                  </p>
                </div>

                <div className="h-56">
                  {profitData.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
                      No profit data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={profitData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ stroke: "#334155" }}
                          contentStyle={{
                            backgroundColor: "#020617",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#e5e7eb",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [
                            `₦${value.toLocaleString()}`,
                            "Profit",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#4ade80"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#4ade80" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Products Overview
                  </h2>
                  <p className="text-sm text-slate-400">
                    Quick view of current product records.
                  </p>
                </div>

                <ProductTable products={recentProducts} />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-xl font-semibold text-white">
                  Recent Activity
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Latest inventory actions across your system.
                </p>

                <div className="mt-6 space-y-4">
                  {activities.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">
                        No recent activity yet.
                      </p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getActionClasses(
                                  activity.action
                                )}`}
                              >
                                {activity.action}
                              </span>

                              <p className="text-sm font-semibold text-white">
                                {activity.productName}
                              </p>
                            </div>

                            <p className="mt-2 text-sm text-slate-400">
                              {activity.change}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              SKU: {activity.sku}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs text-slate-500">
                            {formatActivityDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
}

export default Dashboard;