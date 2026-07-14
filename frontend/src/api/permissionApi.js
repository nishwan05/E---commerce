import api from "./authApi";
export const getPermissions = () => api.get("/permissions");
export const updatePermissionApi = (data) => api.put("/permissions", data);
