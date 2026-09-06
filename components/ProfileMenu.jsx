"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileMenu() {
  const { user, profileImage, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "My account";

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={profileImage} name={fullName} size={32} />
        <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.firstName || "Account"}</span>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            role="menuitem"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/change-password"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            role="menuitem"
          >
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full border-t border-slate-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}