import { ImageIcon, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import EmptyState from "./EmptyState";

function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  return `${baseUrl}${image}`;
}

function ProductImage({ product }) {
  const imageUrl = getImageUrl(product.image);

  if (!imageUrl) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <ImageIcon size={20} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={product.name}
      className="h-12 w-12 shrink-0 rounded-xl object-cover"
    />
  );
}

function ProductTable({
  products = [],
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
}) {
  const getStatusClasses = (status) => {
    if (status === "In Stock") {
      return "bg-green-500/15 text-green-600 dark:text-green-300";
    }

    if (status === "Low Stock") {
      return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
    }

    return "bg-red-500/15 text-red-600 dark:text-red-300";
  };

  const formatMoney = (value) => `₦${Number(value || 0).toLocaleString()}`;

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        message="Start by adding your first inventory item to StockPilot."
      />
    );
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        {products.map((product) => {
          const profitPerUnit = (product.price || 0) - (product.costPrice || 0);

          return (
            <div
              key={product._id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <ProductImage product={product} />

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-950 dark:text-white">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    product.status
                  )}`}
                >
                  {product.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {product.category}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {product.quantity}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Cost Price</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {formatMoney(product.costPrice)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Selling Price</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {formatMoney(product.price)}
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3">
                  <p className="text-xs text-green-600 dark:text-green-300">
                    Profit / Unit
                  </p>
                  <p className="mt-1 font-semibold text-green-700 dark:text-green-400">
                    {formatMoney(profitPerUnit)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onStockIn?.(product)}
                  className="rounded-xl border border-green-500/30 py-2 text-green-600 transition hover:bg-green-500/10 dark:text-green-300"
                  title="Stock In"
                >
                  <Plus size={16} className="mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => onStockOut?.(product)}
                  className="rounded-xl border border-amber-500/30 py-2 text-amber-600 transition hover:bg-amber-500/10 dark:text-amber-300"
                  title="Stock Out"
                >
                  <Minus size={16} className="mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => onEdit?.(product)}
                  className="rounded-xl border border-slate-300 py-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Edit"
                >
                  <Pencil size={16} className="mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete?.(product)}
                  className="rounded-xl border border-red-500/30 py-2 text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                  title="Delete"
                >
                  <Trash2 size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">SKU</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Quantity</th>
                <th className="px-5 py-4 font-medium">Cost Price</th>
                <th className="px-5 py-4 font-medium">Selling Price</th>
                <th className="px-5 py-4 font-medium">Profit / Unit</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const profitPerUnit =
                  (product.price || 0) - (product.costPrice || 0);

                return (
                  <tr
                    key={product._id}
                    className="border-b border-slate-200 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ProductImage product={product} />

                        <span className="font-medium text-slate-950 dark:text-white">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">{product.sku}</td>
                    <td className="px-5 py-4">{product.category}</td>
                    <td className="px-5 py-4">{product.quantity}</td>

                    <td className="px-5 py-4">
                      {formatMoney(product.costPrice)}
                    </td>

                    <td className="px-5 py-4">
                      {formatMoney(product.price)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-green-600 dark:text-green-400">
                      {formatMoney(profitPerUnit)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onStockIn?.(product)}
                          className="rounded-lg border border-green-500/30 p-2 text-green-600 transition hover:bg-green-500/10 dark:text-green-300"
                          title="Stock In"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onStockOut?.(product)}
                          className="rounded-lg border border-amber-500/30 p-2 text-amber-600 transition hover:bg-amber-500/10 dark:text-amber-300"
                          title="Stock Out"
                        >
                          <Minus size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit?.(product)}
                          className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete?.(product)}
                          className="rounded-lg border border-red-500/30 p-2 text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ProductTable;