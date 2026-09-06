"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { blogService } from "@/services/blog.service";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/Avatar";
import Loader from "@/components/Loader";
import BlogCard from "@/components/BlogCard";

export default function DashboardHome() {
  const { user, profileImage } = useAuth();
  const [stats, setStats] = useState({ total: 0, mine: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await blogService.list();
        if (!cancelled) {
          setRecent(list.slice(0, 3));
          setStats((s) => ({ ...s, total: list.length }));
        }
        if (user?.id) {
          const mine = list.filter(
            (b) => (b.userId || b.authorId || b.user?._id) === user.id
          );
          if (!cancelled) setStats((s) => ({ ...s, mine: mine.length }));
        }
      } catch (e) {
        // ignore — empty state handles UX
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "there";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.firstName || fullName}!
          </h1>
          <p className="text-sm text-slate-600">
            Here&apos;s a quick look at your activity.
          </p>
        </div>
        <Link href="/dashboard/blogs/create" className="btn-primary">
          ✍️ Create Blog
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Blogs" value={stats.total} />
        <StatCard label="My Blogs" value={stats.mine} />
        <div className="card flex items-center gap-4">
          <Avatar src={profileImage} name={fullName} size={56} />
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Profile</p>
            <p className="text-sm font-semibold text-slate-800">{fullName}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <Link href="/dashboard/profile" className="link text-xs">Edit profile</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Blogs</h2>
          <Link href="/dashboard/blogs" className="link text-sm">View all</Link>
        </div>
        {loading ? (
          <Loader label="Loading recent blogs..." />
        ) : recent.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">
            No blogs yet. Be the first to publish!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b) => (
              <BlogCard key={b._id || b.id} blog={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}