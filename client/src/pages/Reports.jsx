import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { getProducts } from "../services/productService";
import { getTransactions } from "../services/transactionService";
import { getBusinessProfile } from "../services/businessProfileService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3,
  Download,
  FileText,
  Package,
  TrendingUp,
} from "lucide-react";

function Reports() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [reportType, setReportType] = useState("transactions");
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currency = businessProfile?.currency || "NGN";
  const businessName = businessProfile?.businessName || "StockPilot Business";

  useEffect(() => {
    let isMounted = true;

    const loadReportsData = async () => {
      try {
        const [productData, transactionData, profileData] = await Promise.all([
          getProducts(),
          getTransactions(),
          getBusinessProfile(),
        ]);

        if (isMounted) {
          setProducts(productData);
          setTransactions(transactionData);
          setBusinessProfile(profileData);
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load reports data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReportsData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getPeriodKey = (dateValue) => {
    const date = new Date(dateValue);
    const year = date.getFullYear();

    if (period === "weekly") {
      const firstDay = new Date(year, 0, 1);
      const pastDays = Math.floor((date - firstDay) / 86400000);
      const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
      return `${year} - Week ${week}`;
    }

    if (period === "yearly") {
      return `${year}`;
    }

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
    });
  };

  const analytics = useMemo(() => {
    const sales = transactions.filter((transaction) => transaction.type === "OUT");

    const totalRevenue = sales.reduce(
      (sum, transaction) => sum + (transaction.totalValue || 0),
      0
    );

    const totalProfit = sales.reduce(
      (sum, transaction) => sum + (transaction.profit || 0),
      0
    );

    const totalUnitsSold = sales.reduce(
      (sum, transaction) => sum + (transaction.quantity || 0),
      0
    );

    const lowStockProducts = products.filter(
      (product) => product.status === "Low Stock"
    );

    const outOfStockProducts = products.filter(
      (product) => product.status === "Out of Stock"
    );

    const grouped = {};

    sales.forEach((transaction) => {
      const key = getPeriodKey(transaction.createdAt);

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          revenue: 0,
          profit: 0,
          unitsSold: 0,
          salesCount: 0,
        };
      }

      grouped[key].revenue += transaction.totalValue || 0;
      grouped[key].profit += transaction.profit || 0;
      grouped[key].unitsSold += transaction.quantity || 0;
      grouped[key].salesCount += 1;
    });

    return {
      totalRevenue,
      totalProfit,
      totalUnitsSold,
      salesCount: sales.length,
      lowStockProducts,
      outOfStockProducts,
      periodRows: Object.values(grouped),
    };
  }, [transactions, products, period]);

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).replace(/"/g, '""');

    if (
      stringValue.includes(",") ||
      stringValue.includes("\n") ||
      stringValue.includes('"')
    ) {
      return `"${stringValue}"`;
    }

    return stringValue;
  };

  const downloadCsv = (filename, headers, rows) => {
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const getReportData = () => {
    if (reportType === "products") {
      return {
        title: "Products Report",
        headers: [
          "Product",
          "SKU",
          "Category",
          "Quantity",
          "Cost Price",
          "Selling Price",
          "Profit / Unit",
          "Status",
          "Supplier",
        ],
        rows: products.map((product) => [
          product.name,
          product.sku,
          product.category,
          product.quantity,
          product.costPrice || 0,
          product.price || 0,
          (product.price || 0) - (product.costPrice || 0),
          product.status,
          product.supplier || "",
        ]),
      };
    }

    if (reportType === "low-stock") {
      return {
        title: "Low Stock Report",
        headers: [
          "Product",
          "SKU",
          "Category",
          "Quantity",
          "Reorder Level",
          "Status",
          "Supplier",
        ],
        rows: [...analytics.lowStockProducts, ...analytics.outOfStockProducts].map(
          (product) => [
            product.name,
            product.sku,
            product.category,
            product.quantity,
            product.reorderLevel,
            product.status,
            product.supplier || "",
          ]
        ),
      };
    }

    if (reportType === "profit") {
      return {
        title: `${
          period.charAt(0).toUpperCase() + period.slice(1)
        } Profit Report`,
        headers: ["Period", "Revenue", "Profit", "Units Sold", "Sales Count"],
        rows: analytics.periodRows.map((row) => [
          row.period,
          row.revenue,
          row.profit,
          row.unitsSold,
          row.salesCount,
        ]),
      };
    }

    return {
      title: "Transactions Report",
      headers: [
        "Product",
        "SKU",
        "Type",
        "Quantity",
        "Unit Price",
        "Total Value",
        "Profit",
        "Customer",
        "Payment Method",
        "Note",
        "Date",
      ],
      rows: transactions.map((transaction) => [
        transaction.productName,
        transaction.sku,
        transaction.type === "IN" ? "Stock In" : "Sale",
        transaction.quantity,
        transaction.unitPrice || 0,
        transaction.totalValue || 0,
        transaction.type === "OUT" ? transaction.profit || 0 : "",
        transaction.customerName || "",
        transaction.paymentMethod || "",
        transaction.note || "",
        new Date(transaction.createdAt).toLocaleString(),
      ]),
    };
  };

  const handleExportCsv = () => {
    const report = getReportData();

    if (report.rows.length === 0) {
      setError("No data available to export.");
      return;
    }

    downloadCsv(
      `stockpilot-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`,
      report.headers,
      report.rows
    );

    setError("");
  };

  const handleExportPdf = () => {
    const report = getReportData();

    if (report.rows.length === 0) {
      setError("No data available to export.");
      return;
    }

    const doc = new jsPDF();

    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, 210, 34, "F");

    doc.setFillColor(34, 211, 238);
    doc.rect(0, 0, 6, 34, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(businessName, 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(report.title, 14, 23);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 29);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);

    doc.text(
      `Revenue: ${currency} ${analytics.totalRevenue.toLocaleString()}`,
      14,
      46
    );
    doc.text(
      `Profit: ${currency} ${analytics.totalProfit.toLocaleString()}`,
      14,
      53
    );
    doc.text(`Units Sold: ${analytics.totalUnitsSold}`, 14, 60);

    autoTable(doc, {
      startY: 70,
      head: [report.headers],
      body: report.rows,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
      },
    });

    doc.save(
      `stockpilot-${reportType}-${new Date().toISOString().slice(0, 10)}.pdf`
    );

    setError("");
  };

  return (
    <AppLayout>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              Reports Center
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Export transactions, products, low-stock records, revenue, and
              profit reports.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 px-5 py-3 font-semibold text-cyan-600 transition hover:bg-cyan-500/10 dark:text-cyan-300"
            >
              <Download size={18} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <FileText size={18} />
              Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="mt-4 h-10 w-32 bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>

            <Skeleton className="h-72 w-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <TrendingUp className="text-cyan-500" size={20} />
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                  {currency} {analytics.totalRevenue.toLocaleString()}
                </h3>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Total Profit
                  </p>
                  <BarChart3 className="text-green-500" size={20} />
                </div>
                <h3 className="mt-3 text-2xl font-bold text-green-700 dark:text-green-400">
                  {currency} {analytics.totalProfit.toLocaleString()}
                </h3>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Units Sold</p>
                  <Package className="text-cyan-500" size={20} />
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                  {analytics.totalUnitsSold}
                </h3>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  Low / Out of Stock
                </p>
                <h3 className="mt-3 text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {analytics.lowStockProducts.length +
                    analytics.outOfStockProducts.length}
                </h3>
              </div>
            </div>

            <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="transactions">Transactions Report</option>
                  <option value="products">Products Report</option>
                  <option value="low-stock">Low Stock Report</option>
                  <option value="profit">Revenue & Profit Report</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Revenue / Profit Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {reportType === "profit" ? (
              analytics.periodRows.length === 0 ? (
                <EmptyState
                  title="No profit records yet"
                  message="Revenue and profit reports will appear after you record sales transactions."
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                        <tr>
                          <th className="px-5 py-4">Period</th>
                          <th className="px-5 py-4">Revenue</th>
                          <th className="px-5 py-4">Profit</th>
                          <th className="px-5 py-4">Units Sold</th>
                          <th className="px-5 py-4">Sales Count</th>
                        </tr>
                      </thead>

                      <tbody>
                        {analytics.periodRows.map((row) => (
                          <tr
                            key={row.period}
                            className="border-b border-slate-200 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                          >
                            <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">
                              {row.period}
                            </td>
                            <td className="px-5 py-4 text-cyan-600 dark:text-cyan-300">
                              {currency} {row.revenue.toLocaleString()}
                            </td>
                            <td className="px-5 py-4 font-semibold text-green-600 dark:text-green-400">
                              {currency} {row.profit.toLocaleString()}
                            </td>
                            <td className="px-5 py-4">{row.unitsSold}</td>
                            <td className="px-5 py-4">{row.salesCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Export Preview
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Select a report type and export as CSV or PDF. Preview table
                  is shown directly for revenue and profit reports.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </AppLayout>
  );
}

export default Reports;