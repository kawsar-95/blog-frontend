"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { blogService } from "@/services/blog.service";
import BlogCard from "@/components/BlogCard";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import EmptyState from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Loader";
import PublicNavbar from "@/components/PublicNavbar";
import ProfileMenu from "@/components/ProfileMenu";
import Footer from "@/components/Footer";

const CATEGORIES = [
  "All",
  "Testing",
  "Automation",
  "Programming",
  "DevOps",
  "AI",
  "Web Development",
  "Mobile",
  "Cloud",
  "Security",
];

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("All");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => fetchBlogs(), 250); // debounce for search
    return () => { cancelled = true; clearTimeout(t); };

    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (title.trim()) params.title = title.trim();
        if (category && category !== "All") params.category = category;
        const list = await blogService.list(params);
        if (!cancelled) setBlogs(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load blogs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
  }, [title, category]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar
        searchSlot={
          <SearchBar
            value={title}
            onChange={setTitle}
            onSubmit={() => {}}
            placeholder="Search blogs..."
          />
        }
        rightSlot={
          isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Register</Link>
            </div>
          )
        }
      />

      {/* Mobile search row */}
      <div className="pt-20 lg:hidden">
        <div className="mx-auto max-w-7xl px-4">
          <SearchBar
            value={title}
            onChange={setTitle}
            onSubmit={() => {}}
            placeholder="Search blogs..."
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-12 text-white shadow sm:px-10">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Discover & share great ideas
          </h1>
          <p className="mt-2 max-w-2xl text-brand-100">
            A modern blog platform built with Next.js. Read articles from our
            community, search by title, or filter by category.
          </p>
        </section>

        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Latest blogs</h2>
            <CategoryFilter
              categories={CATEGORIES}
              value={category}
              onChange={setCategory}
            />
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : blogs.length === 0 ? (
          <EmptyState
            title="No blogs found"
            message="Try a different search term or category."
            icon="🔎"
            action={
              <button
                onClick={() => { setTitle(""); setCategory("All"); }}
                className="btn-secondary"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <BlogCard key={b._id || b.id} blog={b} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}