import API from "./api";

export const getInvoices = async () => {
  const response = await API.get("/invoices");
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await API.post("/invoices", invoiceData);
  return response.data;
};