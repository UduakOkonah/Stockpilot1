
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Package,
  Plus,
  RefreshCw,
  ScanBarcode,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import AppLayout from "../components/layout/AppLayout";
import ProductTable from "../components/ui/ProductTable";
import AddProductModal from "../components/ui/AddProductModal";
import EditProductModal from "../components/ui/EditProductModal";
import DeleteProductModal from "../components/ui/DeleteProductModal";
import StockTransactionModal from "../components/ui/StockTransactionModal";
import QuickSellScannerModal from "../components/ui/QuickSellScannerModal";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

import { getProducts } from "../services/productService";
import { quickSellTransaction } from "../services/transactionService";

const LOW_STOCK_THRESHOLD = 5;

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function getStockQuantity(product) {
  return Math.max(0, Number(product.quantity) || 0);
}

function getProductValue(product) {
  const quantity = getStockQuantity(product);
  const price = Number(product.price) || 0;

  return quantity * price;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={21} aria-hidden="true" />
          </div>
        )}
      </div>
    </article>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] =
    useState(false);
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);

  const [transactionType, setTransactionType] = useState("IN");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getProducts();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an invalid product list.");
      }

      setProducts(data);
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load products. Please try again.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeProducts = async () => {
      try {
        const data = await getProducts();

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load products. Check your connection and try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      await loadProducts({ silent: true });
    } catch {
      toast.error("Could not refresh products.");
    }
  }, [loadProducts]);

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const totalUnits = products.reduce(
      (total, product) => total + getStockQuantity(product),
      0
    );

    const lowStockProducts = products.filter((product) => {
      const quantity = getStockQuantity(product);

      return quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
    }).length;

    const outOfStockProducts = products.filter(
      (product) => getStockQuantity(product) === 0
    ).length;

    const inventoryValue = products.reduce(
      (total, product) => total + getProductValue(product),
      0
    );

    return {
      totalProducts,
      totalUnits,
      lowStockProducts,
      outOfStockProducts,
      inventoryValue,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      const quantity = getStockQuantity(product);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" &&
          quantity > 0 &&
          quantity <= LOW_STOCK_THRESHOLD) ||
        (stockFilter === "out" && quantity === 0) ||
        (stockFilter === "available" &&
          quantity > LOW_STOCK_THRESHOLD);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const closeProductModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsTransactionModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleStockIn = (product) => {
    setSelectedProduct(product);
    setTransactionType("IN");
    setIsTransactionModalOpen(true);
  };

  const handleStockOut = (product) => {
    setSelectedProduct(product);
    setTransactionType("OUT");
    setIsTransactionModalOpen(true);
  };

  const handleCompleteQuickSale = async (saleItems) => {
    if (!Array.isArray(saleItems) || saleItems.length === 0) {
      toast.error("Add at least one product to complete the sale.");
      return;
    }

    const invalidItem = saleItems.find(
      (item) =>
        !item.productId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
    );

    if (invalidItem) {
      toast.error("Check the selected products and quantities.");
      return;
    }

    const loadingToast = toast.loading("Completing quick sale...");

    try {
      const items = saleItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }));

      // Keep the existing service signature: quickSellTransaction(items).
      const response = await quickSellTransaction(items);

      // A completed sale should not be reported as failed just because
      // the follow-up product refresh fails.
      toast.success(
        response?.message || "Quick sale completed successfully.",
        { id: loadingToast }
      );

      setIsQuickSellOpen(false);

      try {
        await loadProducts({ silent: true });
      } catch {
        toast.error(
          "Sale completed, but inventory could not refresh. Reload the page to see the latest stock."
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to complete quick sale.",
        { id: loadingToast }
      );

      // Rethrow so the scanner modal can handle the failed submission
      // if its implementation supports error propagation.
      throw err;
    }
  };

  return (
    <AppLayout>
      <section className="space-y-6 pb-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                <Boxes size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Products
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage products, monitor inventory, and process sales.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsQuickSellOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:text-emerald-300"
            >
              <ScanBarcode size={18} />
              Quick Sell
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* Inventory statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Products"
            value={stats.totalProducts.toLocaleString()}
            description="Registered inventory items"
            icon={Package}
            iconClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
          />

          <StatCard
            title="Total Stock Units"
            value={stats.totalUnits.toLocaleString()}
            description="Units currently in inventory"
            icon={Boxes}
            iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
          />

          <StatCard
            title="Low Stock"
            value={stats.lowStockProducts.toLocaleString()}
            description={`Between 1 and ${LOW_STOCK_THRESHOLD} units`}
            icon={TrendingDown}
            iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-300"
          />

          <StatCard
            title="Inventory Value"
            value={formatCurrency(stats.inventoryValue)}
            description={`${stats.outOfStockProducts} products out of stock`}
            icon={CircleDollarSign}
            iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          />
        </div>

        {/* Search and filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product name, SKU, barcode, or category..."
                aria-label="Search products"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="stock-filter"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400"
              >
                Stock status
              </label>

              <select
                id="stock-filter"
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All products</option>
                <option value="available">Available stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>

              <button
                type="button"
                onClick={refreshProducts}
                disabled={refreshing || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {!loading && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>
                Showing{" "}
                <strong className="text-slate-800 dark:text-slate-200 dark:text-slate-200">
                  {filteredProducts.length}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-800 dark:text-slate-200 dark:text-slate-200">
                  {products.length}
                </strong>{" "}
                products
              </span>

              {stats.outOfStockProducts > 0 && (
                <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <AlertCircle size={14} />
                  {stats.outOfStockProducts} out of stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Unable to load the latest inventory
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshProducts}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-300"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Try again
            </button>
          </div>
        )}

        {/* Product list */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-9 w-24 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-6 space-y-4">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 w-full bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          search || stockFilter !== "all" ? (
            <EmptyState
              title="No matching products"
              message="Try another search term or change the stock filter to find products."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStockFilter("all");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              title="No products available"
              message="Start by adding your first inventory product to StockPilot."
              action={
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Plus size={18} />
                  Add Product
                </button>
              }
            />
          )
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  Inventory
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Review stock levels and manage product records.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={15} />
                Inventory overview
              </div>
            </div>

            <ProductTable
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStockIn={handleStockIn}
              onStockOut={handleStockOut}
            />
          </div>
        )}

        {/* Quick sale scanner */}
        <QuickSellScannerModal
          isOpen={isQuickSellOpen}
          onClose={() => setIsQuickSellOpen(false)}
          products={products}
          onCompleteSale={handleCompleteQuickSale}
        />

        {/* Add product */}
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onProductAdded={refreshProducts}
        />

        {/* Edit product */}
        <EditProductModal
          key={selectedProduct?._id || "edit-product-modal"}
          isOpen={isEditModalOpen}
          onClose={closeProductModals}
          product={selectedProduct}
          onProductUpdated={refreshProducts}
        />

        {/* Delete product */}
        <DeleteProductModal
          key={selectedProduct?._id || "delete-product-modal"}
          isOpen={isDeleteModalOpen}
          onClose={closeProductModals}
          product={selectedProduct}
          onDeleted={refreshProducts}
        />

        {/* Stock transaction */}
        <StockTransactionModal
          key={`${selectedProduct?._id || "stock-transaction"}-${transactionType}`}
          isOpen={isTransactionModalOpen}
          onClose={closeProductModals}
          product={selectedProduct}
          type={transactionType}
          onCompleted={refreshProducts}
        />
      </section>
    </AppLayout>
  );
}

export default Products;
