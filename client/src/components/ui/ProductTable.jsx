import { Pencil, Trash2, Plus, Minus } from "lucide-react";

function ProductTable({ products, onEdit, onDelete, onStockIn, onStockOut }) {
  const getStatusClasses = (status) => {
    if (status === "In Stock") return "bg-green-500/15 text-green-300";
    if (status === "Low Stock") return "bg-amber-500/15 text-amber-300";
    return "bg-red-500/15 text-red-300";
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-8 text-center text-slate-400">
        No products found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        {products.map((product) => (
          <div
            key={product._id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{product.name}</h3>
                <p className="mt-1 text-xs text-slate-500">SKU: {product.sku}</p>
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
              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Category</p>
                <p className="mt-1 text-slate-200">{product.category}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Quantity</p>
                <p className="mt-1 font-semibold text-white">{product.quantity}</p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Price</p>
                <p className="mt-1 text-slate-200">
                  ₦{product.price?.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3">
                <p className="text-xs text-slate-500">Stock</p>
                <p className="mt-1 text-slate-200">{product.status}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onStockIn?.(product)}
                className="rounded-xl border border-green-500/30 py-2 text-green-300 hover:bg-green-500/10"
              >
                <Plus size={16} className="mx-auto" />
              </button>

              <button
                type="button"
                onClick={() => onStockOut?.(product)}
                className="rounded-xl border border-amber-500/30 py-2 text-amber-300 hover:bg-amber-500/10"
              >
                <Minus size={16} className="mx-auto" />
              </button>

              <button
                type="button"
                onClick={() => onEdit?.(product)}
                className="rounded-xl border border-slate-700 py-2 text-slate-300 hover:bg-slate-800"
              >
                <Pencil size={16} className="mx-auto" />
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(product)}
                className="rounded-xl border border-red-500/30 py-2 text-red-300 hover:bg-red-500/10"
              >
                <Trash2 size={16} className="mx-auto" />
              </button>
            </div>
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
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Quantity</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-slate-800 text-slate-300 last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-white">
                    {product.name}
                  </td>
                  <td className="px-5 py-4">{product.sku}</td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4">{product.quantity}</td>
                  <td className="px-5 py-4">
                    ₦{product.price?.toLocaleString()}
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
                        className="rounded-lg border border-green-500/30 p-2 text-green-300 transition hover:bg-green-500/10"
                        title="Stock In"
                      >
                        <Plus size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onStockOut?.(product)}
                        className="rounded-lg border border-amber-500/30 p-2 text-amber-300 transition hover:bg-amber-500/10"
                        title="Stock Out"
                      >
                        <Minus size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit?.(product)}
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete?.(product)}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default ProductTable;