const BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const auth = () => {
  const token = localStorage.getItem("token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAdminStats = async () => {
  const r = await fetch(`${BASE}/api/admin/stats`, { headers: auth() });
  return r.json();
};

export const getCompletedBookings = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${BASE}/api/admin/bookings/completed?${q}`, {
    headers: auth(),
  });
  return r.json();
};

export const setCompletionApproval = async (bookingId, decision, note = "") => {
  const r = await fetch(`${BASE}/api/admin/bookings/${bookingId}/approval`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...auth() },
    body: JSON.stringify({ decision, note }),
  });
  return r.json();
};

export const getTransactions = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${BASE}/api/admin/transactions?${q}`, {
    headers: auth(),
  });
  return r.json();
};

export const setTransactionStatus = async (txnId, status) => {
  const r = await fetch(`${BASE}/api/admin/transactions/${txnId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...auth() },
    body: JSON.stringify({ status }),
  });
  return r.json();
};

export const listUsers = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${BASE}/api/admin/users?${q}`, { headers: auth() });
  return r.json();
};

export const getUserById = async (id) => {
  const r = await fetch(`${BASE}/api/admin/users/${id}`, { headers: auth() });
  return r.json();
};

export const verifyUser = async (id, verified) => {
  const r = await fetch(`${BASE}/api/admin/users/${id}/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...auth() },
    body: JSON.stringify({ verified }),
  });
  return r.json();
};

export const uploadUserDoc = async (id, { type, value, file, url }) => {
  const fd = new FormData();
  if (type) fd.append("type", type);
  if (value) fd.append("value", value);
  if (url) fd.append("url", url);
  if (file) fd.append("file", file);
  const r = await fetch(`${BASE}/api/admin/users/${id}/document`, {
    method: "POST",
    headers: auth(),
    body: fd,
  });
  return r.json();
};