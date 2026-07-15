import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
export default api;
