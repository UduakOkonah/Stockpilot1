function TransactionTable({ transactions, onGenerateReceipt }) {
  const getTypeClasses = (type) => {
    if (type === "IN") {
      return "bg-green-500/15 text-green-300";
    }

    return "bg-amber-500/15 text-amber-300";
  };

  const formatDate = (date) => {
    const transactionDate = new Date(date);

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
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-8 text-center text-slate-400">
        No transactions found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">
                  {transaction.productName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  SKU: {transaction.sku}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeClasses(
                  transaction.type
                )}`}
              >
                {transaction.type === "IN" ? "Stock In" : "Sale"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Quantity</p>
                <p className="mt-1 font-semibold text-white">
                  {transaction.quantity}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Unit Price</p>
                <p className="mt-1 text-slate-200">
                  ₦{transaction.unitPrice?.toLocaleString() || 0}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Total Value</p>
                <p className="mt-1 font-semibold text-cyan-300">
                  ₦{transaction.totalValue?.toLocaleString() || 0}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Profit</p>
                <p className="mt-1 font-semibold text-green-400">
                  {transaction.type === "OUT"
                    ? `₦${transaction.profit?.toLocaleString() || 0}`
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Payment</p>
                <p className="mt-1 text-slate-200">
                  {transaction.paymentMethod || "N/A"}
                </p>
              </div>
            </div>

            {transaction.customerName && (
              <p className="mt-4 rounded-xl bg-slate-950 p-3 text-sm text-slate-400">
                Customer: {transaction.customerName}
              </p>
            )}

            {transaction.note && (
              <p className="mt-3 rounded-xl bg-slate-950 p-3 text-sm text-slate-400">
                {transaction.note}
              </p>
            )}

            <p className="mt-3 text-xs text-slate-500">
              {formatDate(transaction.createdAt)}
            </p>

            {transaction.type === "OUT" && (
              <button
                type="button"
                onClick={() => onGenerateReceipt?.(transaction)}
                className="mt-4 w-full rounded-xl border border-cyan-500/30 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
              >
                Generate Receipt
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">SKU</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Quantity</th>
                <th className="px-5 py-4 font-medium">Unit Price</th>
                <th className="px-5 py-4 font-medium">Total Value</th>
                <th className="px-5 py-4 font-medium">Profit</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Payment</th>
                <th className="px-5 py-4 font-medium">Note</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Receipt</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-slate-800 text-slate-300 last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-white">
                    {transaction.productName}
                  </td>
                  <td className="px-5 py-4">{transaction.sku}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeClasses(
                        transaction.type
                      )}`}
                    >
                      {transaction.type === "IN" ? "Stock In" : "Sale"}
                    </span>
                  </td>
                  <td className="px-5 py-4">{transaction.quantity}</td>
                  <td className="px-5 py-4">
                    ₦{transaction.unitPrice?.toLocaleString() || 0}
                  </td>
                  <td className="px-5 py-4 font-semibold text-cyan-300">
                    ₦{transaction.totalValue?.toLocaleString() || 0}
                  </td>
                  <td className="px-5 py-4 font-semibold text-green-400">
                    {transaction.type === "OUT"
                      ? `₦${transaction.profit?.toLocaleString() || 0}`
                      : "-"}
                  </td>
                  <td className="px-5 py-4">
                    {transaction.customerName || "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    {transaction.paymentMethod || "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    {transaction.note || "No note"}
                  </td>
                  <td className="px-5 py-4">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {transaction.type === "OUT" ? (
                      <button
                        type="button"
                        onClick={() => onGenerateReceipt?.(transaction)}
                        className="rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                      >
                        Receipt
                      </button>
                    ) : (
                      <span className="text-slate-500">N/A</span>
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