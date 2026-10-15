import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import TransactionTable from "../components/ui/TransactionTable";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { getTransactions } from "../services/transactionService";
import { getBusinessProfile } from "../services/businessProfileService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const cardClasses =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5";

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const secondaryButtonClasses =
  "w-full rounded-xl border border-cyan-500/30 px-5 py-3 font-semibold text-cyan-600 transition hover:bg-cyan-500/10 dark:text-cyan-300 sm:w-auto";

const primaryButtonClasses =
  "w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      try {
        const [transactionData, profileData] = await Promise.all([
          getTransactions(),
          getBusinessProfile(),
        ]);

        if (isMounted) {
          setTransactions(transactionData);
          setBusinessProfile(profileData);
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load transactions.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.productName?.toLowerCase().includes(query) ||
        transaction.sku?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" || transaction.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const summary = useMemo(() => {
    const stockInCount = transactions.filter((t) => t.type === "IN").length;
    const stockOutCount = transactions.filter((t) => t.type === "OUT").length;

    const totalUnitsMoved = transactions.reduce(
      (sum, transaction) => sum + (transaction.quantity || 0),
      0
    );

    const totalRevenue = transactions
      .filter((transaction) => transaction.type === "OUT")
      .reduce((sum, transaction) => sum + (transaction.totalValue || 0), 0);

    const totalProfit = transactions
      .filter((transaction) => transaction.type === "OUT")
      .reduce((sum, transaction) => sum + (transaction.profit || 0), 0);

    return {
      stockInCount,
      stockOutCount,
      totalUnitsMoved,
      totalRevenue,
      totalProfit,
    };
  }, [transactions]);

  const currency = businessProfile?.currency || "NGN";

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

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      setError("No transactions available to export.");
      return;
    }

    const headers = [
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
    ];

    const rows = filteredTransactions.map((transaction) => [
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
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `stockpilot-transactions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setError("");
  };

  const handleExportPdf = () => {
    if (filteredTransactions.length === 0) {
      setError("No transactions available to export.");
      return;
    }

    const businessName =
      businessProfile?.businessName || "StockPilot Business";

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`${businessName} Transactions Report`, 14, 18);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    doc.setFontSize(11);
    doc.text(`Stock In Records: ${summary.stockInCount}`, 14, 36);
    doc.text(`Stock Out Records: ${summary.stockOutCount}`, 14, 43);
    doc.text(`Total Units Moved: ${summary.totalUnitsMoved}`, 14, 50);
    doc.text(
      `Estimated Revenue: ${currency} ${summary.totalRevenue.toLocaleString()}`,
      14,
      57
    );
    doc.text(
      `Total Profit: ${currency} ${summary.totalProfit.toLocaleString()}`,
      14,
      64
    );

    autoTable(doc, {
      startY: 73,
      head: [
        [
          "Product",
          "SKU",
          "Type",
          "Qty",
          "Unit Price",
          "Total Value",
          "Profit",
          "Customer",
          "Payment",
          "Date",
        ],
      ],
      body: filteredTransactions.map((transaction) => [
        transaction.productName,
        transaction.sku,
        transaction.type === "IN" ? "Stock In" : "Sale",
        transaction.quantity,
        `${currency} ${transaction.unitPrice?.toLocaleString() || 0}`,
        `${currency} ${transaction.totalValue?.toLocaleString() || 0}`,
        transaction.type === "OUT"
          ? `${currency} ${transaction.profit?.toLocaleString() || 0}`
          : "-",
        transaction.customerName || "N/A",
        transaction.paymentMethod || "N/A",
        new Date(transaction.createdAt).toLocaleString(),
      ]),
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
      `stockpilot-transactions-${new Date().toISOString().slice(0, 10)}.pdf`
    );

    setError("");
  };

  const handleGenerateReceipt = (transaction) => {
    const profile = businessProfile || {};
    const receiptCurrency = profile.currency || "NGN";
    const receiptPrefix = profile.receiptPrefix || "SP";
    const businessName = profile.businessName || "StockPilot Business";

    const doc = new jsPDF();

    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, 210, 42, "F");

    doc.setFillColor(34, 211, 238);
    doc.rect(0, 0, 6, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(businessName, 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let y = 24;

    if (profile.showBusinessEmail && profile.email) {
      doc.text(`Email: ${profile.email}`, 14, y);
      y += 5;
    }

    if (profile.showBusinessPhone && profile.phone) {
      doc.text(`Phone: ${profile.phone}`, 14, y);
      y += 5;
    }

    if (profile.showBusinessAddress && profile.address) {
      doc.text(`Address: ${profile.address}`, 14, y);
    }

    doc.setFillColor(34, 211, 238);
    doc.roundedRect(150, 12, 45, 16, 3, 3, "F");

    doc.setTextColor(2, 6, 23);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SALES RECEIPT", 157, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text("SALES RECEIPT", 14, 50);

    doc.setFontSize(10);
    doc.text(
      `Receipt ID: ${receiptPrefix}-${transaction._id.slice(-6).toUpperCase()}`,
      14,
      55
    );

    doc.text(
      `Date: ${new Date(transaction.createdAt).toLocaleString()}`,
      14,
      62
    );
    doc.text(
      `Customer: ${transaction.customerName || "Walk-in Customer"}`,
      14,
      73
    );
    doc.text(`Payment Method: ${transaction.paymentMethod || "N/A"}`, 14, 80);

    autoTable(doc, {
      startY: 92,
      head: [["Product", "SKU", "Qty", "Unit Price", "Total"]],
      body: [
        [
          transaction.productName,
          transaction.sku,
          transaction.quantity,
          `${receiptCurrency} ${transaction.unitPrice?.toLocaleString() || 0}`,
          `${receiptCurrency} ${transaction.totalValue?.toLocaleString() || 0}`,
        ],
      ],
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.text(
      `Total Paid: ${receiptCurrency} ${
        transaction.totalValue?.toLocaleString() || 0
      }`,
      14,
      finalY
    );

    if (profile.showThankYouMessage) {
      doc.setFontSize(10);
      doc.text("Thank you for your purchase.", 14, finalY + 14);
    }

    doc.setFontSize(9);
    doc.text("Generated by StockPilot Smart Inventory System", 14, finalY + 22);

    doc.save(`${receiptPrefix}-receipt-${transaction._id.slice(-6)}.pdf`);
  };

  return (
    <AppLayout>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-w-0"
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.45 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              Transactions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 dark:text-slate-400 sm:text-base">
              View stock-in, stock-out, and estimated sales movement history.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExportCsv}
              className={secondaryButtonClasses}
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className={primaryButtonClasses}
            >
              Export PDF
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        >
          {[
            {
              label: "Stock In Records",
              value: summary.stockInCount,
              className: cardClasses,
              textClass: "text-slate-950 dark:text-white",
              labelClass: "text-slate-600 dark:text-slate-400 dark:text-slate-400",
            },
            {
              label: "Stock Out Records",
              value: summary.stockOutCount,
              className: cardClasses,
              textClass: "text-slate-950 dark:text-white",
              labelClass: "text-slate-600 dark:text-slate-400 dark:text-slate-400",
            },
            {
              label: "Total Units Moved",
              value: summary.totalUnitsMoved,
              className: cardClasses,
              textClass: "text-slate-950 dark:text-white",
              labelClass: "text-slate-600 dark:text-slate-400 dark:text-slate-400",
            },
            {
              label: "Estimated Revenue",
              value: `${currency} ${summary.totalRevenue.toLocaleString()}`,
              className:
                "rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 shadow-sm sm:p-5",
              textClass: "text-cyan-700 dark:text-cyan-300",
              labelClass: "text-cyan-700 dark:text-cyan-200",
            },
            {
              label: "Total Profit",
              value: `${currency} ${summary.totalProfit.toLocaleString()}`,
              className:
                "rounded-2xl border border-green-500/20 bg-green-500/10 p-4 shadow-sm sm:p-5",
              textClass: "text-green-700 dark:text-green-400",
              labelClass: "text-green-700 dark:text-green-200",
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className={item.className}
            >
              <p className={`text-sm ${item.labelClass}`}>{item.label}</p>
              <h3 className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${item.textClass}`}>
                {item.value}
              </h3>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.45 }}
          className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_180px]"
        >
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={inputClasses}
          >
            <option value="ALL">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </motion.div>

        {error && !loading && (
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-5 w-48" />

              <div className="mt-6 space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title={
                search || typeFilter !== "ALL"
                  ? "No matching transactions"
                  : "No transactions yet"
              }
              message={
                search || typeFilter !== "ALL"
                  ? "No transactions match your current search or filter."
                  : "Sales and stock movement records will appear here once transactions are created."
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <TransactionTable
                transactions={filteredTransactions}
                onGenerateReceipt={handleGenerateReceipt}
              />
            </div>
          )}
        </motion.div>
      </motion.section>
    </AppLayout>
  );
}

export default Transactions;