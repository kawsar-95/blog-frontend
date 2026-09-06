"use client";

export default function Alert({ type = "info", children, className = "" }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[type];
  return (
    <div className={"rounded-lg border px-4 py-3 text-sm " + styles + " " + className} role="alert">
      {children}
    </div>
  );
}