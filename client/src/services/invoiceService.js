import api from "./api";

export const createInvoice = async (invoiceData) => {
  const response = await api.post("/invoices", invoiceData);
  return response.data;
};

export const getInvoices = async () => {
  const response = await api.get("/invoices");
  return response.data;
};

export const sendInvoiceEmail = async (id) => {
  const response = await api.post(`/invoices/${id}/send-email`);
  return response.data;
};