"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Protected from "@/components/Protected";
import Sidebar from "@/components/Sidebar";
import ProfileMenu from "@/components/ProfileMenu";

/**
 * Dashboard layout: fixed navbar + sidebar + main content.
 * Used by all /dashboard/* and /admin/* routes.
 */
export default function DashboardLayoutShell({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <Protected>
      <div className="min-h-screen bg-slate-50">
        <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              ☰
            </button>
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
              <span className="hidden sm:inline">BlogSpace</span>
            </Link>
            <h1 className="ml-2 hidden truncate text-sm font-medium text-slate-600 md:block">
              {title}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/" className="btn-secondary hidden sm:inline-flex">View Site</Link>
              <ProfileMenu />
            </div>
          </div>
        </header>

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="pt-16 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </Protected>
  );
}