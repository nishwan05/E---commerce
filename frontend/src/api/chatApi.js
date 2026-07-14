import api from "./authApi";
export const getMessagesByTicket = async (ticketId) => { const res = await api.get(`/chat/tickets/${encodeURIComponent(ticketId)}`); return res.data; };
export const getMessages = getMessagesByTicket;
export const getConversations = async () => { const res = await api.get("/chat/conversations"); return res.data; };
