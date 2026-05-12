import { useMemo, useState } from "react";
import { ScanBarcode, Trash2, X } from "lucide-react";
import BarcodeScannerModal from "./BarcodeScannerModal";
import toast from "react-hot-toast";

function QuickSellScannerModal({
  isOpen,
  onClose,
  products = [],
  onCompleteSale,
}) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [saleItems, setSaleItems] = useState([]);

  const totalAmount = useMemo(
    () => saleItems.reduce((sum, item) => sum + item.total, 0),
    [saleItems]
  );

  if (!isOpen) return null;

  const findProductByBarcode = (barcode) => {
    const cleanedBarcode = barcode.trim();

    return products.find(
      (product) =>
        product.barcode?.trim() === cleanedBarcode ||
        product.sku?.trim().toLowerCase() === cleanedBarcode.toLowerCase()
    );
  };

  const handleScan = (barcode) => {
    const product = findProductByBarcode(barcode);

    if (!product) {
      toast.error("Product not found. Add it first.");
      return;
    }

    if (product.quantity <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    setSaleItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product._id);

      if (existingItem) {
        if (existingItem.quantity + 1 > product.quantity) {
          toast.error("Not enough stock available.");
          return prev;
        }

        return prev.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          quantity: 1,
          unitPrice: product.price || 0,
          total: product.price || 0,
          availableStock: product.quantity,
        },
      ];
    });

    toast.success(`${product.name} added.`);
  };

  const increaseQty = (productId) => {
    setSaleItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;

        if (item.quantity + 1 > item.availableStock) {
          toast.error("Not enough stock available.");
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
          total: (item.quantity + 1) * item.unitPrice,
        };
      })
    );
  };

  const decreaseQty = (productId) => {
    setSaleItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                total: (item.quantity - 1) * item.unitPrice,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setSaleItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCompleteSale = async () => {
    if (saleItems.length === 0) {
      toast.error("Scan at least one product.");
      return;
    }

    await onCompleteSale(saleItems);

    setSaleItems([]);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
                <ScanBarcode size={22} className="text-cyan-500" />
                Quick Sell Scanner
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Scan products quickly and complete a sale during rush hours.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <ScanBarcode size={20} />
              Scan Product
            </button>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-950 dark:text-white">
                  Sale Items
                </p>

                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-300">
                  ₦{totalAmount.toLocaleString()}
                </p>
              </div>

              {saleItems.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No items scanned yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {saleItems.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            SKU: {item.sku} · Stock: {item.availableStock}
                          </p>

                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            ₦{item.unitPrice.toLocaleString()} each
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseQty(item.productId)}
                            className="h-9 w-9 rounded-xl border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            -
                          </button>

                          <span className="min-w-8 text-center font-bold text-slate-950 dark:text-white">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQty(item.productId)}
                            className="h-9 w-9 rounded-xl border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="h-9 w-9 rounded-xl border border-red-500/30 text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                          >
                            <Trash2 size={16} className="mx-auto" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-right font-bold text-cyan-600 dark:text-cyan-300">
                        ₦{item.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={saleItems.length === 0}
              className="w-full rounded-2xl bg-green-500 px-5 py-4 font-bold text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>

      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </>
  );
}

export default QuickSellScannerModal;