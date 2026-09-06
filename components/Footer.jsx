"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} BlogSpace — A Next.js + Tailwind demo.</p>
        <div className="flex gap-4">
          <Link href="/" className="link">Home</Link>
          <Link href="/login" className="link">Login</Link>
          <Link href="/register" className="link">Register</Link>
        </div>
      </div>
    </footer>
  );
}