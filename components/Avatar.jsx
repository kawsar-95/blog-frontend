"use client";
import { initialsOf, avatarUrl } from "@/utils/format";
import { API_URL } from "@/lib/http/config";

export default function Avatar({ src, name, size = 36, className = "" }) {
  const url = avatarUrl(src, API_URL);
  const dim = { width: size, height: size };
  if (url) {
    return (
      <img
        src={url}
        alt={name || "Avatar"}
        {...dim}
        className={
          "rounded-full object-cover ring-2 ring-white " + className
        }
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <span
      style={dim}
      className={
        "inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ring-2 ring-white " +
        className
      }
    >
      <span style={{ fontSize: Math.max(10, size / 2.4) }}>
        {initialsOf(name)}
      </span>
    </span>
  );
}