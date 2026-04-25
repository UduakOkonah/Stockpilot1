import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import ProductTable from "../components/ui/ProductTable";
import AddProductModal from "../components/ui/AddProductModal";
import EditProductModal from "../components/ui/EditProductModal";
import DeleteProductModal from "../components/ui/DeleteProductModal";
import StockTransactionModal from "../components/ui/StockTransactionModal";
import { getProducts } from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("IN");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();

        if (isMounted) {
          setProducts(data);
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
      setProducts(data);
      setError("");
    } catch {
      setError("Failed to refresh products.");
    }
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

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [products, search]);

  return (
    <AppLayout>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Products</h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Manage inventory items, stock quantity, and product records.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
          >
            Add Product
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>

        {error && !loading && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading products...</p>
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
          />
        )}

        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onProductAdded={refreshProducts}
        />

        <EditProductModal
          key={selectedProduct?._id || "edit-product-modal"}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          product={selectedProduct}
          onProductUpdated={refreshProducts}
        />

        <DeleteProductModal
          key={selectedProduct?._id || "delete-product-modal"}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          product={selectedProduct}
          onDeleted={refreshProducts}
        />

        <StockTransactionModal
          key={`${selectedProduct?._id || "stock-transaction"}-${transactionType}`}
          isOpen={isTransactionModalOpen}
          onClose={closeTransactionModal}
          product={selectedProduct}
          type={transactionType}
          onCompleted={refreshProducts}
        />
      </section>
    </AppLayout>
  );
}

export default Products;