import api from "./authApi";

export const getMyNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data;
};

export const markAllRead = async () => {
  const res = await api.patch("/notifications/mark-all-read");
  return res.data;
};

export const markOneRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};
