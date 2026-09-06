"use client";
import Link from "next/link";

export default function PublicNavbar({ searchSlot, rightSlot }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
          <span>BlogSpace</span>
        </Link>
        <div className="ml-2 hidden flex-1 md:block">{searchSlot}</div>
        <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}