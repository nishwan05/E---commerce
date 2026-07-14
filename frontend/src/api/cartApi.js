import api from "./authApi";
export const getCart = async () => { const res = await api.get("/cart"); return res.data; };
export const updateCart = async (cart) => { const res = await api.put("/cart", { cart }); return res.data; };
