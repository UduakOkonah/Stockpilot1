import { useEffect, useMemo, useState } from "react";
import { ScanBarcode } from "lucide-react";
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
import {quickSellTransaction } from "../services/transactionService";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);

  const [transactionType, setTransactionType] = useState("IN");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();

        if (isMounted) {
          setProducts(data || []);
          setError("");
        }
      } catch {
        if (isMounted) setError("Failed to load products.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
      setError("");
    } catch {
      setError("Failed to refresh products.");
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query)
    );
  }, [products, search]);

const handleCompleteQuickSale = async (saleItems) => {
  const loadingToast = toast.loading("Completing quick sale...");

  try {
    const payload = {
      items: saleItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customerName: "Quick Sale Customer",
      paymentMethod: "Cash",
    };

    const response = await quickSellTransaction(payload.items);

    await refreshProducts();

    toast.success(
      response.message || "Quick sale completed successfully.",
      {
        id: loadingToast,
      }
    );
  } catch (err) {
    toast.error(
      err?.response?.data?.message ||
        "Failed to complete quick sale.",
      {
        id: loadingToast,
      }
    );
  }
};

  return (
    <AppLayout>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              Products
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Manage inventory items, stock quantity, and product records.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsQuickSellOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/30 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-500/10 dark:text-green-300 sm:w-auto"
            >
              <ScanBarcode size={18} />
              Quick Sell
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
            >
              Add Product
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {error && !loading && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-slate-800" />

            <div className="mt-6 space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 w-full bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title={search ? "No matching products" : "No products available"}
            message={
              search
                ? "No products match your current search. Try another product name, SKU, or barcode."
                : "Start by adding your first inventory product to StockPilot."
            }
            action={
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Add Product
              </button>
            }
          />
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={(product) => {
              setSelectedProduct(product);
              setIsEditModalOpen(true);
            }}
            onDelete={(product) => {
              setSelectedProduct(product);
              setIsDeleteModalOpen(true);
            }}
            onStockIn={(product) => {
              setSelectedProduct(product);
              setTransactionType("IN");
              setIsTransactionModalOpen(true);
            }}
            onStockOut={(product) => {
              setSelectedProduct(product);
              setTransactionType("OUT");
              setIsTransactionModalOpen(true);
            }}
          />
        )}

        <QuickSellScannerModal
          isOpen={isQuickSellOpen}
          onClose={() => setIsQuickSellOpen(false)}
          products={products}
          onCompleteSale={handleCompleteQuickSale}
        />

        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onProductAdded={refreshProducts}
        />

        <EditProductModal
          key={selectedProduct?._id || "edit-product-modal"}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onProductUpdated={refreshProducts}
        />

        <DeleteProductModal
          key={selectedProduct?._id || "delete-product-modal"}
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onDeleted={refreshProducts}
        />

        <StockTransactionModal
          key={`${selectedProduct?._id || "stock-transaction"}-${transactionType}`}
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          type={transactionType}
          onCompleted={refreshProducts}
        />
      </section>
    </AppLayout>
  );
}

export default Products;