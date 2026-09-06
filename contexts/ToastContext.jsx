// contexts/ToastContext.jsx — minimal toast notification state (rendering lives in
// components/ToastContainer.jsx).
"use client";

import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", ttl = 4000) => {
      const id = ++_id;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (ttl > 0) setTimeout(() => remove(id), ttl);
      return id;
    },
    [remove]
  );

  const value = {
    toasts,
    push,
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error", 6000),
    info: (m) => push(m, "info"),
    remove,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
