"use client";
import { useToast } from "@/contexts/ToastContext";

// The rendered toast stack, extracted out of ToastContext so that context owns state only.
export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="pointer-events-none fixed top-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur " +
            (t.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-slate-200 bg-white text-slate-900")
          }
        >
          <span className="text-lg leading-none">
            {t.type === "success" ? "✓" : t.type === "error" ? "⚠" : "ℹ"}
          </span>
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="text-sm text-slate-400 hover:text-slate-700"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
