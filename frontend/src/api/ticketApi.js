import api from "./authApi";
export const getTickets = async () => {
  const res = await api.get("/tickets");
  return res.data;
};
export const getTicketByTicketId = (id) => api.get(`/tickets/${id}`);
export const claimTicket = async (id) => {
  const res = await api.patch(`/tickets/${id}/claim`);
  return res.data;
};
export const closeTicket = async (id) => {
  const res = await api.patch(`/tickets/${id}/close`);
  return res.data;
};
export const createTicket = async (data) => api.post("/tickets", data);
export const getMyTickets = async () => api.get("/tickets/my");
export const getAllTickets = async () => api.get("/tickets");
