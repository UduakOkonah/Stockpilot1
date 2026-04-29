import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteProduct } from "../../services/productService";
import toast from "react-hot-toast";

function DeleteProductModal({ isOpen, onClose, product, onDeleted }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            Delete Product
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-500/15 p-3 text-red-400">
              <Trash2 size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-300">
                Are you sure you want to delete
              </p>
              <h3 className="mt-1 font-semibold text-white">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteProductModal;