
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { getProducts } from "../services/productService";
import { getBusinessProfile } from "../services/businessProfileService";
import {
  createInvoice,
  getInvoices,
  sendInvoiceEmail,
} from "../services/invoiceService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  Save,
  Download,
  Mail,
  RefreshCw,
} from "lucide-react";

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/40";

const cardClasses =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";
function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getArray(response, key) {
  const value = unwrap(response);

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.results)) return value.results;

  return [];
}

function money(value, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `₦${(Number(value) || 0).toLocaleString("en-NG")}`;
  }
}

function getProductId(product) {
  return product?._id ?? product?.id ?? "";
}

function getProductName(product) {
  return product?.name ?? product?.productName ?? "Unnamed product";
}

function getProductPrice(product) {
  return Number(product?.sellingPrice ?? product?.price ?? 0);
}

function getProductStock(product) {
  return Number(
    product?.quantity ??
      product?.stock ??
      product?.currentStock ??
      0
  );
}

function getInvoiceItems(invoice) {
  return Array.isArray(invoice?.items) ? invoice.items : [];
}

export default function InvoiceBuilder() {
  const [products, setProducts] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [note, setNote] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState(null);
  const [error, setError] = useState("");

  const currency = businessProfile?.currency || "NGN";

  const selectedProduct = products.find(
    (product) =>
      String(getProductId(product)) === String(selectedProductId)
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity) * Number(item.unitPrice),
        0
      ),
    [items]
  );

  const total = subtotal;

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        getProducts(),
        getBusinessProfile(),
        getInvoices(),
      ]);

      const [productResult, profileResult, invoiceResult] = results;

      if (productResult.status === "rejected") {
        throw productResult.reason;
      }

      setProducts(getArray(productResult.value, "products"));

      if (profileResult.status === "fulfilled") {
        const profileData = unwrap(profileResult.value);

        setBusinessProfile(
          profileData?.businessProfile ??
            profileData?.profile ??
            profileData ??
            null
        );
      }

      if (invoiceResult.status === "fulfilled") {
        setInvoices(getArray(invoiceResult.value, "invoices"));
      } else {
        console.error(
          "Invoice history loading error:",
          invoiceResult.reason
        );
        toast.error("Invoice history could not be loaded.");
      }
    } catch (err) {
      console.error("Invoice Builder loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load the Invoice Builder.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          getProducts(),
          getBusinessProfile(),
          getInvoices(),
        ]);

        if (!active) return;

        const [productResult, profileResult, invoiceResult] = results;

        if (productResult.status === "rejected") {
          throw productResult.reason;
        }

        setProducts(getArray(productResult.value, "products"));

        if (profileResult.status === "fulfilled") {
          const profileData = unwrap(profileResult.value);

          setBusinessProfile(
            profileData?.businessProfile ??
              profileData?.profile ??
              profileData ??
              null
          );
        }

        if (invoiceResult.status === "fulfilled") {
          setInvoices(getArray(invoiceResult.value, "invoices"));
        } else {
          console.error(
            "Invoice history loading error:",
            invoiceResult.reason
          );
        }
      } catch (err) {
        if (!active) return;

        console.error("Invoice Builder loading error:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Could not load the Invoice Builder.";

        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  function handleProductChange(productId) {
    setSelectedProductId(productId);

    const product = products.find(
      (item) => String(getProductId(item)) === String(productId)
    );

    setUnitPrice(
      product ? String(getProductPrice(product)) : ""
    );
  }

  function handleAddItem(event) {
    event.preventDefault();

    if (!selectedProduct) {
      toast.error("Select a product first.");
      return;
    }

    const qty = Number(quantity);
    const price = Number(unitPrice);
    const productId = getProductId(selectedProduct);

    if (!Number.isInteger(qty) || qty < 1) {
      toast.error("Quantity must be a whole number greater than zero.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid unit price.");
      return;
    }

    const alreadyAdded = items
      .filter(
        (item) => String(item.product) === String(productId)
      )
      .reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      );

    const availableStock = getProductStock(selectedProduct);

    if (qty + alreadyAdded > availableStock) {
      toast.error(
        `Only ${Math.max(
          0,
          availableStock - alreadyAdded
        )} more unit(s) available.`
      );
      return;
    }

    const existingItem = items.find(
      (item) => String(item.product) === String(productId)
    );

    if (existingItem) {
      setItems((previous) =>
        previous.map((item) =>
          String(item.product) === String(productId)
            ? {
                ...item,
                quantity: Number(item.quantity) + qty,
                total:
                  (Number(item.quantity) + qty) *
                  Number(item.unitPrice),
              }
            : item
        )
      );
    } else {
      setItems((previous) => [
        ...previous,
        {
          product: productId,
          name: getProductName(selectedProduct),
          sku: selectedProduct?.sku ?? "",
          quantity: qty,
          unitPrice: price,
          total: qty * price,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity("1");
    setUnitPrice("");

    toast.success("Product added to invoice.");
  }

  function resetForm() {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerAddress("");
    setNote("");
    setSelectedProductId("");
    setQuantity("1");
    setUnitPrice("");
    setItems([]);
  }

  function validateInvoice() {
    if (!customerName.trim()) {
      toast.error("Enter the customer's name.");
      return false;
    }

    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      toast.error("Enter a valid customer email address.");
      return false;
    }

    if (items.length === 0) {
      toast.error("Add at least one product to the invoice.");
      return false;
    }

    return true;
  }

  async function handleSaveInvoice(event) {
    event.preventDefault();

    if (saving || !validateInvoice()) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
        items: items.map((item) => ({
          product: item.product,
          name: item.name,
          sku: item.sku,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total:
            Number(item.quantity) * Number(item.unitPrice),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(total.toFixed(2)),
        currency,
        note: note.trim(),
      };

      const response = await createInvoice(payload);
      const result = unwrap(response);

      const invoice =
        result?.invoice ??
        result?.data?.invoice ??
        result;

      if (!invoice || !(invoice._id || invoice.id)) {
        console.error("Unexpected invoice save response:", response);

        throw new Error(
          "The server did not return a saved invoice ID. Check the invoice backend."
        );
      }

      setInvoices((previous) => [
        invoice,
        ...previous.filter(
          (entry) =>
            String(entry._id ?? entry.id) !==
            String(invoice._id ?? invoice.id)
        ),
      ]);

      toast.success("Invoice saved successfully.");
      resetForm();
    } catch (err) {
      console.error("Save invoice error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save invoice.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function generatePdf(invoiceData = null) {
    const data = invoiceData ?? {
      customerName,
      customerEmail,
      customerAddress,
      items,
      subtotal,
      total,
      currency,
      note,
    };

    const doc = new jsPDF();

    const businessName =
      businessProfile?.businessName ??
      businessProfile?.name ??
      "StockPilot";

    doc.setFontSize(20);
    doc.text(String(businessName), 14, 20);

    doc.setFontSize(10);

    const businessDetails = [
      businessProfile?.address,
      businessProfile?.phone,
      businessProfile?.email,
    ].filter(Boolean);

    let y = 28;

    businessDetails.forEach((detail) => {
      const lines = doc.splitTextToSize(String(detail), 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });

    y += 5;

    doc.setFontSize(16);
    doc.text("INVOICE", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(
      `Customer: ${data.customerName || "Customer"}`,
      14,
      y
    );
    y += 6;

    if (data.customerEmail) {
      doc.text(`Email: ${data.customerEmail}`, 14, y);
      y += 6;
    }

    if (data.customerAddress) {
      const addressLines = doc.splitTextToSize(
        `Address: ${data.customerAddress}`,
        180
      );

      doc.text(addressLines, 14, y);
      y += addressLines.length * 5;
    }

    if (data.invoiceNumber) {
      doc.text(`Invoice No: ${data.invoiceNumber}`, 14, y);
      y += 6;
    }

    doc.text(
      `Date: ${new Date(
        data.createdAt || Date.now()
      ).toLocaleDateString()}`,
      14,
      y
    );

    const rows = getInvoiceItems(data).map((item) => [
      item.name ?? item.productName ?? "Product",
      String(item.quantity ?? 0),
      money(
        item.unitPrice ?? item.price ?? 0,
        data.currency || currency
      ),
      money(
        item.total ??
          Number(item.quantity ?? 0) *
            Number(item.unitPrice ?? item.price ?? 0),
        data.currency || currency
      ),
    ]);

    autoTable(doc, {
      startY: y + 8,
      head: [["Product", "Qty", "Unit Price", "Amount"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [8, 145, 178] },
      margin: { left: 14, right: 14 },
    });

    let finalY = (doc.lastAutoTable?.finalY ?? y + 30) + 10;

    if (finalY > 260) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(11);
    doc.text(
      `Subtotal: ${money(
        data.subtotal ?? data.total ?? 0,
        data.currency || currency
      )}`,
      14,
      finalY
    );

    doc.setFontSize(13);
    doc.text(
      `Total: ${money(
        data.total ?? data.subtotal ?? 0,
        data.currency || currency
      )}`,
      14,
      finalY + 8
    );

    if (data.note) {
      const noteLines = doc.splitTextToSize(
        `Note: ${data.note}`,
        180
      );

      let noteY = finalY + 18;

      if (noteY + noteLines.length * 5 > 280) {
        doc.addPage();
        noteY = 20;
      }

      doc.setFontSize(10);
      doc.text(noteLines, 14, noteY);
    }

    const safeName = String(
      data.customerName || "customer"
    )
      .trim()
      .replace(/[^a-z0-9-_]/gi, "_");

    doc.save(`invoice-${safeName}.pdf`);
  }

  async function handleSendInvoiceEmail(invoice) {
    const invoiceId = invoice?._id ?? invoice?.id;

    if (!invoiceId) {
      toast.error("Save the invoice before sending it.");
      return;
    }

    if (!invoice.customerEmail) {
      toast.error("This invoice has no customer email address.");
      return;
    }

    setSendingInvoiceId(String(invoiceId));

    try {
      await sendInvoiceEmail(invoiceId);
      toast.success("Invoice email sent successfully.");
    } catch (err) {
      console.error("Send invoice email error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not send the invoice email."
      );
    } finally {
      setSendingInvoiceId(null);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 p-4 md:p-6">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Invoice Builder
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, save, download, and email customer invoices.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveInvoice} className="space-y-6">
          <section className={cardClasses}>
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <FileText size={18} />
              Customer details
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Customer name *
                <input
                  className={inputClasses}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Customer email
                <input
                  className={inputClasses}
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Customer address
                <input
                  className={inputClasses}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </label>
            </div>
          </section>

          <section className={cardClasses}>
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
              Add products
            </h2>

            <div className="grid items-end gap-3 md:grid-cols-4">
              <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">
                Product
                <select
                  className={inputClasses}
                  value={selectedProductId}
                  onChange={(e) =>
                    handleProductChange(e.target.value)
                  }
                >
                  <option value="">Select a product</option>

                  {products.map((product) => (
                    <option
                      key={getProductId(product)}
                      value={getProductId(product)}
                    >
                      {getProductName(product)} — Stock:{" "}
                      {getProductStock(product)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantity
                <input
                  className={inputClasses}
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Unit price
                <input
                  className={inputClasses}
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              <Plus size={16} />
              Add product
            </button>

            {products.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                No products were returned by the product API. Check your
                product service and backend.
              </p>
            )}
          </section>

          <section className={cardClasses}>
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
              Invoice items
            </h2>

            {items.length === 0 ? (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                No products added yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-3 pr-3">Product</th>
                      <th className="py-3 pr-3">Quantity</th>
                      <th className="py-3 pr-3">Unit price</th>
                      <th className="py-3">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.product}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 pr-3 font-medium text-slate-800 dark:text-slate-200">
                          {item.name}

                          {item.sku && (
                            <span className="block text-xs text-slate-500">
                              SKU: {item.sku}
                            </span>
                          )}
                        </td>

                        <td className="py-3 pr-3">{item.quantity}</td>

                        <td className="py-3 pr-3">
                          {money(item.unitPrice, currency)}
                        </td>

                        <td className="py-3 font-medium">
                          {money(item.total, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <label className="mt-5 block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              Invoice note
              <textarea
                className={inputClasses}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment terms or additional information..."
              />
            </label>

            <div className="ml-auto mt-5 max-w-sm space-y-3 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{money(subtotal, currency)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
                <span>Total</span>
                <span>{money(total, currency)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || items.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving invoice..." : "Save invoice"}
              </button>

              <button
                type="button"
                onClick={() => generatePdf()}
                disabled={items.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </section>
        </form>

        <section className={cardClasses}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Invoice history
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {invoices.length} invoice
              {invoices.length === 1 ? "" : "s"}
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-8 text-center">
              <FileText
                className="mx-auto mb-3 text-slate-400"
                size={32}
              />
              <p className="text-sm text-slate-500">
                No saved invoices yet. Create and save your first invoice above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 pr-3">Invoice</th>
                    <th className="py-3 pr-3">Customer</th>
                    <th className="py-3 pr-3">Date</th>
                    <th className="py-3 pr-3">Total</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => {
                    const id = invoice._id ?? invoice.id;

                    const invoiceDate = invoice.createdAt
                      ? new Date(invoice.createdAt).toLocaleDateString()
                      : "—";

                    return (
                      <tr
                        key={id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 pr-3 font-medium text-slate-800 dark:text-slate-200">
                          {invoice.invoiceNumber ||
                            String(id || "").slice(-8) ||
                            "Invoice"}
                        </td>

                        <td className="py-3 pr-3">
                          <div>{invoice.customerName || "—"}</div>

                          {invoice.customerEmail && (
                            <div className="text-xs text-slate-500">
                              {invoice.customerEmail}
                            </div>
                          )}
                        </td>

                        <td className="py-3 pr-3">{invoiceDate}</td>

                        <td className="py-3 pr-3 font-semibold">
                          {money(
                            invoice.total ?? invoice.subtotal ?? 0,
                            invoice.currency || currency
                          )}
                        </td>

                        <td className="py-3 pr-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
                            {invoice.status || "Saved"}
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => generatePdf(invoice)}
                              title="Download PDF"
                              aria-label="Download invoice PDF"
                              className="rounded-lg p-2 text-cyan-700 hover:bg-cyan-50"
                            >
                              <Download size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSendInvoiceEmail(invoice)
                              }
                              disabled={
                                sendingInvoiceId === String(id) ||
                                !invoice.customerEmail
                              }
                              title="Email invoice"
                              aria-label="Email invoice"
                              className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Mail size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
