const API_ORIGIN = "http://localhost:5001";

export const getMediaUrl = (path) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};
