"use client";
import Link from "next/link";

/**
 * Reusable Navbar.
 *
 * @param {object} props
 * @param {() => void} [props.onToggleSidebar] - mobile menu trigger
 * @param {React.ReactNode} [props.searchSlot] - custom search input
 * @param {React.ReactNode} [props.rightSlot] - actions on the right (e.g. auth buttons)
 */
export default function Navbar({ onToggleSidebar, searchSlot, rightSlot }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            ☰
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
          <span>BlogSpace</span>
        </Link>
        <div className="ml-2 hidden flex-1 md:block">
          {searchSlot || (
            <div className="relative">
              <input readOnly placeholder="Search blogs..." className="input pl-9" />
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                🔍
              </span>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}