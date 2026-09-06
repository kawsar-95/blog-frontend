"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function Item({ href, icon, children, onClick }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
        (active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-700 hover:bg-slate-100")
      }
    >
      <span className="w-5 text-center">{icon}</span>
      {children}
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const { isAdmin, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    onClose?.();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={
          "fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        <nav className="flex h-full flex-col justify-between p-4">
          <div className="space-y-1">
            <Item href="/dashboard" icon="🏠" onClick={onClose}>Dashboard</Item>

            {isAdmin ? (
              <Item href="/dashboard/blogs" icon="📚" onClick={onClose}>All Blogs</Item>
            ) : (
              <Item href="/dashboard/blogs" icon="📚" onClick={onClose}>My Blogs</Item>
            )}

            <Item href="/dashboard/blogs/create" icon="✍️" onClick={onClose}>Create Blog</Item>

            {isAdmin && (
              <Item href="/admin/users" icon="👥" onClick={onClose}>Users</Item>
            )}

            <Item href="/dashboard/profile" icon="👤" onClick={onClose}>Profile</Item>
            <Item href="/dashboard/change-password" icon="🔑" onClick={onClose}>Change Password</Item>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <span className="w-5 text-center">⎋</span>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}