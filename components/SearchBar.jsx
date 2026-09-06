"use client";
import Link from "next/link";

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search blogs..." }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className="relative"
      role="search"
    >
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        🔍
      </span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
        aria-label="Search blogs"
      />
    </form>
  );
}