import api from "./authApi";
export const placeOrder = async (data) => { const res = await api.post("/orders", data); return res.data; };
export const getMyOrders = async () => { const res = await api.get("/orders/my-orders"); return res.data; };
export const placeCartOrder = async (data) => { const res = await api.post("/orders/cart-checkout", data); return res.data; };
