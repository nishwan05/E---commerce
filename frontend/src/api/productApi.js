import api from "./authApi";
export const getProducts = async (params, signal) => { const res = await api.get("/products", { params, signal }); return res.data; };
export const getBrands = async (params = {}) => { const res = await api.get("/products/brands", { params }); return res.data; };
export const createProduct = async (data) => { const res = await api.post("/products", data); return res.data; };
export const updateProduct = async (id, data) => { const res = await api.put(`/products/${id}`, data); return res.data; };
export const deleteProduct = async (id) => { const res = await api.delete(`/products/${id}`); return res.data; };
export default api;
