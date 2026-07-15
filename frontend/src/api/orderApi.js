import api from "./authApi";

export const placeOrder = async (data) => {
  const res = await api.post("/orders", data);
  return res.data;
};

export const placeCartOrder = async (data) => {
  const res = await api.post("/orders/cart-checkout", data);
  return res.data;
};

export const getMyOrders = async () => {
  const res = await api.get("/orders/my-orders");
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const getAllOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
};

export const cancelOrder = async (id, reason = "") => {
  const res = await api.patch(`/orders/${id}/cancel`, { reason });
  return res.data;
};
