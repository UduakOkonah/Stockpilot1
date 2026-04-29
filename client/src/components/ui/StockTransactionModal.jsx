import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { createTransaction } from "../../services/transactionService";
import toast from "react-hot-toast";

function StockTransactionModal({ isOpen, onClose, product, type, onCompleted }) {
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !product) return null;

const isStockIn = type === "IN";
const numericQuantity = Number(quantity);

const estimatedValue =
  !isStockIn && numericQuantity > 0 ? numericQuantity * product.price : 0;

const estimatedProfit =
  !isStockIn && numericQuantity > 0
    ? numericQuantity * ((product.price || 0) - (product.costPrice || 0))
    : 0;

const resetForm = () => {
  setQuantity("");
  setNote("");
  setCustomerName("");
  setPaymentMethod("");
  setError("");
};

const handleClose = () => {
  resetForm();
  onClose();
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!numericQuantity || numericQuantity <= 0) {
    const message = "Enter a valid quantity.";
    setError(message);
    toast.error(message);
    return;
  }

  if (!isStockIn && numericQuantity > product.quantity) {
    const message = "Not enough stock available.";
    setError(message);
    toast.error(message);
    return;
  }

  setSubmitting(true);

  const loadingToast = toast.loading(
    isStockIn ? "Adding stock..." : "Recording sale..."
  );

  try {
    await createTransaction({
      productId: product._id,
      type,
      quantity: numericQuantity,
      unitPrice: product.price,
      customerName: isStockIn ? "" : customerName.trim(),
      paymentMethod: isStockIn ? "" : paymentMethod,
      note:
        note.trim() ||
        (isStockIn ? "Stock added" : "Product sold / stock removed"),
    });

    toast.success(isStockIn ? "Stock added successfully!" : "Sale recorded successfully!", {
      id: loadingToast,
    });

    resetForm();
    await onCompleted();
    onClose();
  } catch (err) {
    const message =
      err?.response?.data?.message || "Failed to complete stock transaction.";

    setError(message);

    toast.error(message, {
      id: loadingToast,
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-3 ${
                isStockIn
                  ? "bg-green-500/15 text-green-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {isStockIn ? <Plus size={20} /> : <Minus size={20} />}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {isStockIn ? "Stock In" : "Sell Product"}
              </h2>
              <p className="text-sm text-slate-400">{product.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Current Quantity</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {product.quantity}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              SKU: {product.sku} · ₦{product.price?.toLocaleString()} each
            </p>
          </div>

          {!isStockIn && estimatedValue > 0 && (
            <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-sm text-slate-400">Estimated Sales Value</p>
              <h3 className="mt-1 text-xl font-bold text-cyan-300">
                ₦{estimatedValue.toLocaleString()}
              </h3>
              <p className="text-sm text-green-400">
                Estimated Profit: ₦{estimatedProfit.toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder={isStockIn ? "Quantity to add" : "Quantity sold"}
            />
          </div>

          {!isStockIn && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                  <option value="POS">POS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Note
            </label>
            <textarea
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder={
                isStockIn
                  ? "Example: Restocked from supplier"
                  : "Example: Walk-in customer sale"
              }
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
                isStockIn
                  ? "bg-green-500 hover:bg-green-400"
                  : "bg-amber-500 hover:bg-amber-400"
              }`}
            >
              {submitting
                ? "Processing..."
                : isStockIn
                ? "Add Stock"
                : "Complete Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockTransactionModal;