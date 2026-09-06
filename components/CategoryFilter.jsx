"use client";

export default function CategoryFilter({ categories = [], value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const active = (value || "All") === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange?.(c)}
            className={
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition " +
              (active
                ? "bg-brand-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200")
            }
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}