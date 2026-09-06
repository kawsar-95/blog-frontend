// utils/auth.js — pure helpers for JWT inspection (no library).
export function isJwt(t) {
  return typeof t === "string" && t.split(".").length === 3;
}

export function decodeJwt(token) {
  if (!isJwt(token)) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = part + "===".slice((part.length + 3) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isExpired(token, skewSec = 0) {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() / 1000 >= payload.exp - skewSec;
}

export function roleFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return payload.role || payload.roles || null;
}