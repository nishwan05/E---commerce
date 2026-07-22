import api from "./authApi";
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};
export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
export const getProfile = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};
export const updateProfile = async (data) => {
  const res = await api.put("/users/profile", data);
  return res.data;
};
