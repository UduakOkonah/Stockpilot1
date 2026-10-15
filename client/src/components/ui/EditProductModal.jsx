import { useState } from "react";
import { Barcode, ImagePlus, Pencil, X } from "lucide-react";
import { updateProduct } from "../../services/productService";
import BarcodeScannerModal from "../ui/BarcodeScannerModal";
import toast from "react-hot-toast";

function getInitialFormData(product) {
  return {
    name: product?.name || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    quantity: product?.quantity ?? "",
    costPrice: product?.costPrice ?? "",
    price: product?.price ?? "",
    reorderLevel: product?.reorderLevel ?? "",
    supplier: product?.supplier || "",
    description: product?.description || "",
  };
}

function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  return `${baseUrl}${image}`;
}

function EditProductForm({ product, onClose, onProductUpdated }) {
  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(() => getImageUrl(product?.image));
  const [scannerOpen, setScannerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const estimatedProfitPerUnit =
    Number(formData.price || 0) - Number(formData.costPrice || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleBarcodeScan = (barcode) => {
    setFormData((prev) => ({
      ...prev,
      barcode,
    }));

    setScannerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    const loadingToast = toast.loading("Updating product...");

    try {
      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("sku", formData.sku.trim());
      payload.append("barcode", formData.barcode.trim());
      payload.append("category", formData.category.trim());
      payload.append("quantity", Number(formData.quantity));
      payload.append(
        "costPrice",
        formData.costPrice === "" ? 0 : Number(formData.costPrice)
      );
      payload.append("price", Number(formData.price));
      payload.append(
        "reorderLevel",
        formData.reorderLevel === "" ? 5 : Number(formData.reorderLevel)
      );
      payload.append("supplier", formData.supplier.trim());
      payload.append("description", formData.description.trim());

      if (image) {
        payload.append("image", image);
      }

      await updateProduct(product._id, payload);

      toast.success("Product updated successfully!", {
        id: loadingToast,
      });

      await onProductUpdated();
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to update product. Please try again.";

      setError(message);

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Product Image
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800">
              {preview ? (
                <img
                  src={preview}
                  alt="Product preview"
                  className="h-40 w-40 rounded-2xl object-cover"
                />
              ) : (
                <>
                  <div className="mb-3 rounded-2xl bg-cyan-500/10 p-4 text-cyan-500">
                    <ImagePlus size={28} />
                  </div>

                  <p className="font-medium text-slate-700 dark:text-slate-300 dark:text-slate-200">
                    Upload Product Image
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    PNG, JPG or JPEG
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              SKU
            </label>

            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Barcode
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                placeholder="Scan or enter barcode"
              />

              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-cyan-600 transition hover:bg-cyan-500/20 dark:text-cyan-300"
                title="Scan Barcode"
              >
                <Barcode size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Category
            </label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Cost Price
            </label>

            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Selling Price
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Reorder Level
            </label>

            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              min="0"
              placeholder="5"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm text-green-600 dark:text-green-300">
              Estimated Profit / Unit
            </p>

            <h3 className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
              ₦{estimatedProfitPerUnit.toLocaleString()}
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Supplier
            </label>

            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="e.g Nestle Distributor"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Short product description..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:text-slate-100 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>

      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}

function EditProductModal({ isOpen, onClose, product, onProductUpdated }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
              <Pencil size={22} className="text-cyan-500" />
              Edit Product
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update this inventory record.
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

        <EditProductForm
          key={product._id}
          product={product}
          onClose={onClose}
          onProductUpdated={onProductUpdated}
        />
      </div>
    </div>
  );
}

export default EditProductModal;