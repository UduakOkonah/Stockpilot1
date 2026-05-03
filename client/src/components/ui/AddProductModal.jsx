import { useState } from "react";
import { PackagePlus, X } from "lucide-react";
import { createProduct } from "../../services/productService";
import toast from "react-hot-toast";

const initialFormData = {
  name: "",
  sku: "",
  category: "",
  quantity: "",
  costPrice: "",
  price: "",
  reorderLevel: "",
  supplier: "",
  description: "",
};

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const labelClasses =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const estimatedProfitPerUnit =
    Number(formData.price || 0) - Number(formData.costPrice || 0);

  const resetForm = () => {
    setFormData(initialFormData);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const loadingToast = toast.loading("Creating product...");

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category.trim(),
        quantity: Number(formData.quantity),
        costPrice: formData.costPrice === "" ? 0 : Number(formData.costPrice),
        price: Number(formData.price),
        reorderLevel:
          formData.reorderLevel === "" ? 5 : Number(formData.reorderLevel),
        supplier: formData.supplier.trim(),
        description: formData.description.trim(),
      };

      await createProduct(payload);

      toast.success("Product created successfully!", {
        id: loadingToast,
      });

      resetForm();
      onProductAdded();
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to create product. Please try again.";

      setError(message);

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex gap-3">
            <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 sm:flex">
              <PackagePlus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                Add New Product
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Create a new inventory record for StockPilot.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClasses}>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g. Golden Morn"
              />
            </div>

            <div>
              <label className={labelClasses}>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g. GM001"
              />
            </div>

            <div>
              <label className={labelClasses}>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="e.g. Cereals"
              />
            </div>

            <div>
              <label className={labelClasses}>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className={inputClasses}
                placeholder="0"
              />
            </div>

            <div>
              <label className={labelClasses}>Cost Price</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                min="0"
                className={inputClasses}
                placeholder="Amount you bought it"
              />
            </div>

            <div>
              <label className={labelClasses}>Selling Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className={inputClasses}
                placeholder="Amount you sell it"
              />
            </div>

            <div>
              <label className={labelClasses}>Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                min="0"
                className={inputClasses}
                placeholder="Default is 5"
              />
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
                Estimated Profit / Unit
              </p>

              <h3 className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                ₦{estimatedProfitPerUnit.toLocaleString()}
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className={labelClasses}>Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g. Nestle Distributor"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClasses}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={inputClasses}
                placeholder="Short product description..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;