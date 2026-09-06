// utils/api.js
// Centralized fetch wrapper. Talks to the backend via NEXT_PUBLIC_API_URL.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const TOKEN_KEY = "blogspace_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(headers = {}, needsAuth = false) {
  const h = { Accept: "application/json", ...headers };
  if (needsAuth) {
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function handle(res) {
  // Try to parse JSON even for errors so we can surface backend messages.
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.msg)) ||
      res.statusText ||
      `Request failed (${res.status})`;
    const err = new Error(typeof message === "string" ? message : "Request failed");
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function apiGet(path, { auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: buildHeaders({}, auth),
    cache: "no-store",
  });
  return handle(res);
}

export async function apiPost(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }, auth),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function apiPut(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders({ "Content-Type": "application/json" }, auth),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function apiPatch(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders({ "Content-Type": "application/json" }, auth),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function apiDelete(path, { auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders({}, auth),
  });
  return handle(res);
}

export async function apiPatchForm(path, formData, { auth = true } = {}) {
  // multipart/form-data — let fetch set the boundary.
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders({}, auth),
    body: formData,
  });
  return handle(res);
}

export { API_URL };