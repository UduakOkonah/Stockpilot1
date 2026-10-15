import EmptyState from "./EmptyState";

function TransactionTable({ transactions = [], onGenerateReceipt }) {
  const getTypeClasses = (type) => {
    if (type === "IN") {
      return "bg-green-500/15 text-green-600 dark:text-green-300";
    }

    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  };

  const formatMoney = (value) =>
    `₦${Number(value || 0).toLocaleString("en-NG")}`;

  const formatDate = (date) => {
    if (!date) return "N/A";

    const transactionDate = new Date(date);

    if (Number.isNaN(transactionDate.getTime())) return "N/A";

    return `${transactionDate.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} · ${transactionDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        message="Sales and stock movement records will appear here once transactions are created."
      />
    );
  }

  return (
    <>
      {/* Mobile transaction cards */}
      <div className="space-y-4 md:hidden">
        {transactions.map((transaction, index) => (
          <div
            key={transaction._id || transaction.id || index}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-semibold text-slate-950 dark:text-white">
                  {transaction.productName || "Unnamed product"}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  SKU: {transaction.sku || "N/A"}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Barcode: {transaction.barcode || "N/A"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getTypeClasses(
                  transaction.type
                )}`}
              >
                {transaction.type === "IN" ? "Stock In" : "Sale"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quantity
                </p>
                <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                  {Number(transaction.quantity || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Unit Price
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  {formatMoney(transaction.unitPrice)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Value
                </p>
                <p className="mt-1 break-words font-semibold text-cyan-600 dark:text-cyan-300">
                  {formatMoney(transaction.totalValue)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Profit
                </p>
                <p className="mt-1 break-words font-semibold text-green-600 dark:text-green-400">
                  {transaction.type === "OUT"
                    ? formatMoney(transaction.profit)
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customer
                </p>
                <p className="mt-1 break-words text-slate-700 dark:text-slate-200">
                  {transaction.customerName || "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payment
                </p>
                <p className="mt-1 break-words text-slate-700 dark:text-slate-200">
                  {transaction.paymentMethod || "N/A"}
                </p>
              </div>

              <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Note
                </p>
                <p className="mt-1 break-words text-slate-700 dark:text-slate-200">
                  {transaction.note || "No note"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {formatDate(transaction.createdAt)}
            </p>

            {transaction.type === "OUT" && (
              <button
                type="button"
                onClick={() => onGenerateReceipt?.(transaction)}
                className="mt-4 w-full rounded-xl border border-cyan-500/30 px-4 py-3 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500/10 dark:text-cyan-300"
              >
                Generate Receipt
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop transaction table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px] table-auto border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Product
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  SKU
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Barcode
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Type
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right font-medium">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right font-medium">
                  Unit Price
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right font-medium">
                  Total Value
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right font-medium">
                  Profit
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Customer
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Payment
                </th>
                <th className="px-4 py-4 font-medium">Note</th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-medium">
                  Receipt
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction._id || transaction.id || index}
                  className="text-slate-700 transition hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40"
                >
                  {/* 1. Product */}
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-950 dark:text-white">
                    {transaction.productName || "N/A"}
                  </td>

                  {/* 2. SKU */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {transaction.sku || "N/A"}
                  </td>

                  {/* 3. Barcode */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {transaction.barcode || "N/A"}
                  </td>

                  {/* 4. Type */}
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeClasses(
                        transaction.type
                      )}`}
                    >
                      {transaction.type === "IN" ? "Stock In" : "Sale"}
                    </span>
                  </td>

                  {/* 5. Quantity */}
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    {Number(transaction.quantity || 0).toLocaleString()}
                  </td>

                  {/* 6. Unit Price */}
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    {formatMoney(transaction.unitPrice)}
                  </td>

                  {/* 7. Total Value */}
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-cyan-600 dark:text-cyan-300">
                    {formatMoney(transaction.totalValue)}
                  </td>

                  {/* 8. Profit */}
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                    {transaction.type === "OUT"
                      ? formatMoney(transaction.profit)
                      : "-"}
                  </td>

                  {/* 9. Customer */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {transaction.customerName || "N/A"}
                  </td>

                  {/* 10. Payment */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {transaction.paymentMethod || "N/A"}
                  </td>

                  {/* 11. Note */}
                  <td className="max-w-[220px] px-4 py-4">
                    <span
                      className="block truncate"
                      title={transaction.note || "No note"}
                    >
                      {transaction.note || "No note"}
                    </span>
                  </td>

                  {/* 12. Date */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatDate(transaction.createdAt)}
                  </td>

                  {/* 13. Receipt */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {transaction.type === "OUT" ? (
                      <button
                        type="button"
                        onClick={() => onGenerateReceipt?.(transaction)}
                        className="rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-500/10 dark:text-cyan-300"
                      >
                        Receipt
                      </button>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TransactionTable;