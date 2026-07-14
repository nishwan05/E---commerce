import api from "./authApi";
export const getPages = () => api.get("/pages");
export const createPage = (data) => api.post("/pages", data);
export const updatePage = (id, data) => api.put(`/pages/${id}`, data);
export const deletePage = (id) => api.delete(`/pages/${id}`);
