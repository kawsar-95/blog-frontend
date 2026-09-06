// utils/format.js
export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initialsOf(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

export function truncate(text, n = 140) {
  if (!text) return "";
  const t = String(text);
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// Accept either an absolute URL, a path returned by the API, or undefined.
export function avatarUrl(image, API_URL) {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/")) {
    // Most backends expose uploads at the root (without /api).
    const base = (API_URL || "").replace(/\/api\/?$/, "");
    return `${base}${image}`;
  }
  return image;
}