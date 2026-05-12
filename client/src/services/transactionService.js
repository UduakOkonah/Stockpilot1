import api from "./api";

export const createTransaction = async (data) => {
  const response = await api.post("/transactions", data);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

export const quickSellTransaction = async (items) => {
  const response = await api.post("/transactions/quick-sell", {
    items,
  });

  return response.data;
};

export const quickSellSingleProduct = async ({
  productId,
  quantity = 1,
}) => {
  const response = await api.post("/transactions", {
    productId,
    type: "OUT",
    quantity,
    note: "Quick barcode sale",
  });

  return response.data;
};