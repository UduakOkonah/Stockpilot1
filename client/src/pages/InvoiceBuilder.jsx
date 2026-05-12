import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
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
import { FileText, Mail, Plus, Save, Trash2 } from "lucide-react";

function InvoiceBuilder() {
  const [products, setProducts] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("Thank you for your business.");

  const [loading, setLoading] = useState(true);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [error, setError] = useState("");

  const currency = businessProfile?.currency || "NGN";
  const receiptPrefix = businessProfile?.receiptPrefix || "SP";
  const businessName = businessProfile?.businessName || "StockPilot Business";

  const generateInvoiceNumber = () => {
    const prefix = businessProfile?.receiptPrefix || "SP";
    return `${prefix}-INV-${Date.now()}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);

  const inputClasses =
    "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

  const cardClasses =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [productData, profileData, invoiceData] = await Promise.all([
          getProducts(),
          getBusinessProfile(),
          getInvoices(),
        ]);

        if (isMounted) {
          setProducts(productData || []);
          setBusinessProfile(profileData || null);
          setInvoices(invoiceData || []);
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load invoice builder data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === selectedProductId),
    [products, selectedProductId]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );

  const handleAddItem = () => {
    setError("");

    const numericQuantity = Number(quantity);

    if (!selectedProduct) {
      setError("Select a product.");
      toast.error("Select a product.");
      return;
    }

    if (!numericQuantity || numericQuantity <= 0) {
      setError("Enter a valid quantity.");
      toast.error("Enter a valid quantity.");
      return;
    }

    if (numericQuantity > selectedProduct.quantity) {
      setError("Invoice quantity is higher than available stock.");
      toast.error("Invoice quantity is higher than available stock.");
      return;
    }

    const existingItem = items.find(
      (item) => item.productId === selectedProduct._id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + numericQuantity;

      if (newQuantity > selectedProduct.quantity) {
        setError("Combined invoice quantity is higher than available stock.");
        toast.error("Combined invoice quantity is higher than available stock.");
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.productId === selectedProduct._id
            ? {
                ...item,
                quantity: newQuantity,
                total: newQuantity * item.unitPrice,
              }
            : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          product: selectedProduct._id,
          productId: selectedProduct._id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          quantity: numericQuantity,
          unitPrice: selectedProduct.price || 0,
          total: numericQuantity * (selectedProduct.price || 0),
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity("");
    toast.success("Item added to invoice.");
  };

  const handleRemoveItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const generatePdfFromInvoice = (invoiceData) => {
    const doc = new jsPDF();

    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, 210, 42, "F");

    doc.setFillColor(34, 211, 238);
    doc.rect(0, 0, 6, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(businessName, 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let y = 24;

    if (businessProfile?.showBusinessEmail && businessProfile?.email) {
      doc.text(`Email: ${businessProfile.email}`, 14, y);
      y += 5;
    }

    if (businessProfile?.showBusinessPhone && businessProfile?.phone) {
      doc.text(`Phone: ${businessProfile.phone}`, 14, y);
      y += 5;
    }

    if (businessProfile?.showBusinessAddress && businessProfile?.address) {
      doc.text(`Address: ${businessProfile.address}`, 14, y);
    }

    doc.setFillColor(34, 211, 238);
    doc.roundedRect(154, 12, 40, 16, 3, 3, "F");

    doc.setTextColor(2, 6, 23);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 164, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Invoice No: ${invoiceData.invoiceNumber}`, 14, 55);
    doc.text(
      `Date: ${new Date(invoiceData.createdAt || Date.now()).toLocaleString()}`,
      14,
      62
    );

    doc.setFont("helvetica", "bold");
    doc.text("Bill To", 14, 76);

    doc.setFont("helvetica", "normal");
    doc.text(
      `Customer: ${invoiceData.customerName || "Walk-in Customer"}`,
      14,
      84
    );

    if (invoiceData.customerEmail) {
      doc.text(`Email: ${invoiceData.customerEmail}`, 14, 91);
    }

    if (invoiceData.customerPhone) {
      doc.text(`Phone: ${invoiceData.customerPhone}`, 14, 98);
    }

    if (invoiceData.customerAddress) {
      doc.text(`Address: ${invoiceData.customerAddress}`, 14, 105);
    }

    autoTable(doc, {
      startY: invoiceData.customerAddress ? 116 : 108,
      head: [["Product", "SKU", "Qty", "Unit Price", "Total"]],
      body: invoiceData.items.map((item) => [
        item.name,
        item.sku,
        item.quantity,
        `${invoiceData.currency} ${Number(
          item.unitPrice || 0
        ).toLocaleString()}`,
        `${invoiceData.currency} ${Number(item.total || 0).toLocaleString()}`,
      ]),
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    const finalY = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `Total: ${invoiceData.currency} ${Number(
        invoiceData.subtotal || 0
      ).toLocaleString()}`,
      14,
      finalY
    );

    if (invoiceData.note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(invoiceData.note, 14, finalY + 14);
    }

    doc.setFontSize(9);
    doc.text("Generated by StockPilot Smart Inventory System", 14, finalY + 24);

    doc.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  const handleSaveInvoice = async () => {
    if (items.length === 0) {
      setError("Add at least one invoice item.");
      toast.error("Add at least one invoice item.");
      return;
    }

    setSavingInvoice(true);
    setError("");

    const loadingToast = toast.loading("Saving invoice...");

    try {
      const payload = {
        invoiceNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items,
        subtotal,
        currency,
        note: note.trim(),
      };

      const savedInvoice = await createInvoice(payload);

      setInvoices((prev) => [savedInvoice, ...prev]);

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerAddress("");
      setItems([]);
      setNote("Thank you for your business.");
      setInvoiceNumber(`${receiptPrefix}-INV-${Date.now()}`);

      toast.success("Invoice saved successfully.", {
        id: loadingToast,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to save invoice.";

      setError(message);

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleGenerateInvoice = () => {
    if (items.length === 0) {
      setError("Add at least one invoice item.");
      toast.error("Add at least one invoice item.");
      return;
    }

    const invoiceData = {
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      currency,
      note,
      createdAt: new Date(),
    };

    generatePdfFromInvoice(invoiceData);
    setError("");
  };

const handleSendInvoiceEmail = async (invoice) => {
  try {
    if (!invoice.customerEmail) {
      toast.error("Customer email not found.");
      return;
    }

    const loadingToast = toast.loading(
      "Sending invoice email..."
    );

    const response = await sendInvoiceEmail(invoice._id);

    toast.success(
      response.message || "Invoice email sent successfully.",
      {
        id: loadingToast,
      }
    );
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        "Failed to send invoice email."
    );
  }
};

  return (
    <AppLayout>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              Invoice Builder
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create, save, email, and generate printable invoices from your
              inventory.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={savingInvoice}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 px-5 py-3 font-semibold text-cyan-600 transition hover:bg-cyan-500/10 disabled:opacity-70 dark:text-cyan-300"
            >
              <Save size={18} />
              {savingInvoice ? "Saving..." : "Save Invoice"}
            </button>

            <button
              type="button"
              onClick={handleGenerateInvoice}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <FileText size={18} />
              Generate PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            <Skeleton className="h-32 w-full bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-72 w-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              <div className="space-y-6">
                <div className={cardClasses}>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Customer Details
                  </h2>

                  <div className="mt-5 space-y-4">
                    <input
                      type="text"
                      placeholder="Customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={inputClasses}
                    />

                    <input
                      type="email"
                      placeholder="Customer email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={inputClasses}
                    />

                    <input
                      type="text"
                      placeholder="Customer phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={inputClasses}
                    />

                    <textarea
                      placeholder="Customer address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows="3"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className={cardClasses}>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Add Invoice Item
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_120px]">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} — Stock: {product.quantity}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  {selectedProduct && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                      Selling Price:{" "}
                      <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                        {currency}{" "}
                        {selectedProduct.price?.toLocaleString() || 0}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 px-5 py-3 font-semibold text-cyan-600 transition hover:bg-cyan-500/10 dark:text-cyan-300"
                  >
                    <Plus size={18} />
                    Add Item
                  </button>
                </div>

                <div className={cardClasses}>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Invoice Note
                  </h2>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="4"
                    className={`mt-5 ${inputClasses}`}
                  />
                </div>
              </div>

              <div className={cardClasses}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                      Invoice Preview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {invoiceNumber}
                    </p>
                  </div>

                  <div className="rounded-xl bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-300">
                    {currency} {subtotal.toLocaleString()}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  {items.length === 0 ? (
                    <EmptyState
                      title="No invoice items"
                      message="Select products and add quantities to build your invoice."
                    />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                            <tr>
                              <th className="px-4 py-3">Product</th>
                              <th className="px-4 py-3">Qty</th>
                              <th className="px-4 py-3">Unit Price</th>
                              <th className="px-4 py-3">Total</th>
                              <th className="px-4 py-3"></th>
                            </tr>
                          </thead>

                          <tbody>
                            {items.map((item) => (
                              <tr
                                key={item.productId}
                                className="border-b border-slate-200 text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                              >
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-950 dark:text-white">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    SKU: {item.sku}
                                  </p>
                                </td>
                                <td className="px-4 py-3">{item.quantity}</td>
                                <td className="px-4 py-3">
                                  {currency} {item.unitPrice.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-semibold text-cyan-600 dark:text-cyan-300">
                                  {currency} {item.total.toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveItem(item.productId)
                                    }
                                    className="rounded-lg border border-red-500/30 p-2 text-red-500 transition hover:bg-red-500/10"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${cardClasses} mt-8`}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Invoice History
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Recently saved invoices.
                </p>
              </div>

              {invoices.length === 0 ? (
                <EmptyState
                  title="No invoices yet"
                  message="Saved invoices will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="border-b border-slate-200 last:border-b-0 dark:border-slate-800"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                            {invoice.invoiceNumber}
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {invoice.customerName || "Walk-in Customer"}
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {invoice.customerEmail || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {invoice.items.length}
                          </td>

                          <td className="px-4 py-3 font-semibold text-cyan-600 dark:text-cyan-300">
                            {invoice.currency}{" "}
                            {invoice.subtotal?.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-slate-500">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => generatePdfFromInvoice(invoice)}
                                className="rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-500/10 dark:text-cyan-300"
                              >
                                PDF
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendInvoiceEmail(invoice)}
                                className="rounded-lg border border-green-500/30 px-3 py-2 text-xs font-semibold text-green-600 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-green-300"
                                disabled={!invoice.customerEmail}
                              >
                                Email
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
}

export default InvoiceBuilder;