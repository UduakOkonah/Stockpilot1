import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteProduct } from "../../services/productService";
import toast from "react-hot-toast";

function DeleteProductModal({
  isOpen,
  onClose,
  product,
  onDeleted,
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    const loadingToast = toast.loading("Deleting product...");

    try {
      await deleteProduct(product._id);

      toast.success("Product deleted successfully!", {
        id: loadingToast,
      });

      await onDeleted();
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to delete product. Try again.";

      setError(message);

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Delete Product
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This action cannot be reversed.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-500/10 p-3 text-red-500 dark:text-red-400">
              <Trash2 size={22} />
            </div>

            <div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-300">
                Are you sure you want to permanently delete this product?
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                {product.name}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.category && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-300">
                    {product.category}
                  </span>
                )}

                {product.sku && (
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Deleted products cannot be recovered later.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteProductModal;