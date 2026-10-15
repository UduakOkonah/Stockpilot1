import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Minus,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

/* -----------------------------
   Helpers
----------------------------- */

const LOW_STOCK_THRESHOLD = 5;

function formatMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "₦0.00";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getQuantity(product) {
  return Math.max(0, Number(product?.quantity ?? 0) || 0);
}

function getCostPrice(product) {
  return Number(product?.costPrice ?? product?.cost ?? 0) || 0;
}

function getSellingPrice(product) {
  return Number(product?.price ?? product?.sellingPrice ?? 0) || 0;
}

function getProfitPerUnit(product) {
  return getSellingPrice(product) - getCostPrice(product);
}

function getImageUrl(product) {
  return (
    product?.imageUrl ||
    product?.image ||
    product?.imageURL ||
    product?.photo ||
    ""
  );
}

function getStockStatus(product) {
  const quantity = getQuantity(product);

  if (quantity <= 0) return "Out of stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "Low stock";

  return "In stock";
}

/* -----------------------------
   Product image
----------------------------- */

function ProductImage({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getImageUrl(product);

  if (!imageUrl || imageFailed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <ImageIcon size={20} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={product?.name || "Product"}
      loading="lazy"
      onError={() => setImageFailed(true)}
      className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
    />
  );
}

/* -----------------------------
   Stock status badge
----------------------------- */

function StatusBadge({ product }) {
  const status = getStockStatus(product);

  const styles = {
    "In stock":
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    "Low stock":
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    "Out of stock":
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* -----------------------------
   Action button
----------------------------- */

function ActionButton({
  label,
  onClick,
  children,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
        danger
          ? "text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10"
          : "text-slate-500 hover:bg-slate-100 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
      }`}
    >
      {children}
    </button>
  );
}

/* -----------------------------
   Product actions
----------------------------- */

function ProductActions({
  product,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onStockIn && (
        <ActionButton
          label={`Add stock to ${product?.name || "product"}`}
          onClick={() => onStockIn(product)}
        >
          <Plus size={17} />
        </ActionButton>
      )}

      {onStockOut && (
        <ActionButton
          label={`Remove stock from ${product?.name || "product"}`}
          onClick={() => onStockOut(product)}
        >
          <Minus size={17} />
        </ActionButton>
      )}

      {onEdit && (
        <ActionButton
          label={`Edit ${product?.name || "product"}`}
          onClick={() => onEdit(product)}
        >
          <Pencil size={16} />
        </ActionButton>
      )}

      {onDelete && (
        <ActionButton
          label={`Delete ${product?.name || "product"}`}
          onClick={() => onDelete(product)}
          danger
        >
          <Trash2 size={16} />
        </ActionButton>
      )}
    </div>
  );
}

/* -----------------------------
   Sort header
----------------------------- */

function SortHeader({
  column,
  children,
  className = "",
  sortBy,
  sortDirection,
  onSort,
}) {
  const isActive = sortBy === column;

  return (
    <th
      scope="col"
      aria-sort={
        isActive
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      className={`whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1.5 transition hover:text-cyan-600 dark:hover:text-cyan-300"
      >
        {children}

        {isActive &&
          (sortDirection === "asc" ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          ))}
      </button>
    </th>
  );
}

/* -----------------------------
   Product table
----------------------------- */

export default function ProductTable({
  products = [],
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
}) {
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const safeProducts = Array.isArray(products) ? products : [];

  const sortedProducts = useMemo(() => {
    const getSortValue = (product) => {
      switch (sortBy) {
        case "category":
          return String(product?.category ?? "").toLowerCase();

        case "quantity":
          return getQuantity(product);

        case "price":
          return getSellingPrice(product);

        case "profit":
          return getProfitPerUnit(product);

        case "status":
          return getStockStatus(product);

        case "name":
        default:
          return String(product?.name ?? "").toLowerCase();
      }
    };

    return [...safeProducts].sort((a, b) => {
      const first = getSortValue(a);
      const second = getSortValue(b);

      let comparison = 0;

      if (
        typeof first === "number" &&
        typeof second === "number"
      ) {
        comparison = first - second;
      } else {
        comparison = String(first).localeCompare(String(second));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [safeProducts, sortBy, sortDirection]);

  function handleSort(column) {
    if (sortBy === column) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortBy(column);
    setSortDirection("asc");
  }

  return (
    <section>
      {/* Mobile product cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sortedProducts.map((product, index) => (
          <article
            key={
              product?._id ||
              product?.id ||
              product?.sku ||
              index
            }
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <ProductImage product={product} />

              <div className="min-w-0 flex-1">
                <h3 className="break-words font-semibold text-slate-900 dark:text-slate-100">
                  {product?.name || "Unnamed product"}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  SKU: {product?.sku || "N/A"}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {product?.category || "Uncategorized"}
                </p>
              </div>

              <StatusBadge product={product} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quantity
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {getQuantity(product).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selling price
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {formatMoney(getSellingPrice(product))}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Profit per unit
                </p>
                <p
                  className={`mt-1 font-semibold ${
                    getProfitPerUnit(product) < 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatMoney(getProfitPerUnit(product))}
                </p>
              </div>

              <div className="flex items-center justify-end">
                <ProductActions
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStockIn={onStockIn}
                  onStockOut={onStockOut}
                />
              </div>
            </div>
          </article>
        ))}

        {sortedProducts.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Package
              size={28}
              className="mx-auto mb-3 text-slate-400"
            />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              No products yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a product to start managing your inventory.
            </p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
              <tr>
                <SortHeader
                  column="name"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Product
                </SortHeader>

                <SortHeader
                  column="category"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Category
                </SortHeader>

                <SortHeader
                  column="quantity"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Quantity
                </SortHeader>

                <SortHeader
                  column="price"
                  className="text-right"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Selling price
                </SortHeader>

                <SortHeader
                  column="profit"
                  className="text-right"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Profit / unit
                </SortHeader>

                <SortHeader
                  column="status"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Status
                </SortHeader>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedProducts.map((product, index) => (
                <tr
                  key={
                    product?._id ||
                    product?.id ||
                    product?.sku ||
                    index
                  }
                  className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ProductImage product={product} />

                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate font-semibold text-slate-900 dark:text-slate-100">
                          {product?.name || "Unnamed product"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          SKU: {product?.sku || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                    {product?.category || "Uncategorized"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {getQuantity(product).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatMoney(getSellingPrice(product))}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <span
                      className={
                        getProfitPerUnit(product) < 0
                          ? "font-medium text-rose-600 dark:text-rose-400"
                          : "font-medium text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {formatMoney(getProfitPerUnit(product))}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge product={product} />
                  </td>

                  <td className="px-4 py-4">
                    <ProductActions
                      product={product}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStockIn={onStockIn}
                      onStockOut={onStockOut}
                    />
                  </td>
                </tr>
              ))}

              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <Package size={26} />
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        No products yet
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Add a product to start managing your inventory.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}