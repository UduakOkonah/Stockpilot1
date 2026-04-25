import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import TransactionTable from "../components/ui/TransactionTable";
import { getTransactions } from "../services/transactionService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      try {
        const data = await getTransactions();

        if (isMounted) {
          setTransactions(data);
          setError("");
        }
      } catch {
        if (isMounted) setError("Failed to load transactions.");
      } finally {
        if (isMounted) setLoading(false);
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
      (sum, transaction) => sum + transaction.quantity,
      0
    );

    const totalRevenue = transactions
      .filter((transaction) => transaction.type === "OUT")
      .reduce((sum, transaction) => sum + (transaction.totalValue || 0), 0);

    return {
      stockInCount,
      stockOutCount,
      totalUnitsMoved,
      totalRevenue,
    };
  }, [transactions]);

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

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("StockPilot Transactions Report", 14, 18);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    doc.setFontSize(11);
    doc.text(`Stock In Records: ${summary.stockInCount}`, 14, 36);
    doc.text(`Stock Out Records: ${summary.stockOutCount}`, 14, 43);
    doc.text(`Total Units Moved: ${summary.totalUnitsMoved}`, 14, 50);
    doc.text(
      `Estimated Revenue: NGN ${summary.totalRevenue.toLocaleString()}`,
      14,
      57
    );

    autoTable(doc, {
      startY: 66,
      head: [
        [
          "Product",
          "SKU",
          "Type",
          "Qty",
          "Unit Price",
          "Total Value",
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
        `NGN ${transaction.unitPrice?.toLocaleString() || 0}`,
        `NGN ${transaction.totalValue?.toLocaleString() || 0}`,
        transaction.customerName || "N/A",
        transaction.paymentMethod || "N/A",
        new Date(transaction.createdAt).toLocaleString(),
      ]),
      styles: {
        fontSize: 8,
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

  return (
    <AppLayout>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Transactions
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              View stock-in, stock-out, and estimated sales movement history.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExportCsv}
              className="w-full rounded-xl border border-cyan-500/30 px-5 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/10 sm:w-auto"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Stock In Records</p>
            <h3 className="mt-3 text-3xl font-bold text-white">
              {summary.stockInCount}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Stock Out Records</p>
            <h3 className="mt-3 text-3xl font-bold text-white">
              {summary.stockOutCount}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Units Moved</p>
            <h3 className="mt-3 text-3xl font-bold text-white">
              {summary.totalUnitsMoved}
            </h3>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
            <p className="text-sm text-cyan-200">Estimated Revenue</p>
            <h3 className="mt-3 text-3xl font-bold text-cyan-300">
              ₦{summary.totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_180px]">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>

        {error && !loading && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading transactions...</p>
        ) : (
          <TransactionTable transactions={filteredTransactions} />
        )}
      </section>
    </AppLayout>
  );
}

export default Transactions;