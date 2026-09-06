"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { blogService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/Avatar";
import { SkeletonCard } from "@/components/Loader";
import { formatDate } from "@/utils/format";
import PublicNavbar from "@/components/PublicNavbar";
import ProfileMenu from "@/components/ProfileMenu";
import Footer from "@/components/Footer";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function fetchBlog() {
      try {
        const b = await blogService.get(id);
        if (!cancelled) setBlog(b);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Blog not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) fetchBlog();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar
        rightSlot={
          isAuthenticated ? <ProfileMenu /> : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Register</Link>
            </div>
          )
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-brand-700"
        >
          ← Back
        </button>

        {loading ? (
          <SkeletonCard />
        ) : error || !blog ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <h2 className="text-2xl font-bold text-red-700">Blog Not Found</h2>
            <p className="mt-2 text-sm text-red-600">
              {error || "The blog you are looking for does not exist."}
            </p>
            <Link href="/" className="btn-primary mt-6 inline-flex">
              Back to blogs
            </Link>
          </div>
        ) : (
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <span className="badge">{blog.category || "General"}</span>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
              {blog.blogTitle}
            </h1>
            <div className="mt-4 flex items-center gap-3 border-b border-slate-100 pb-5">
              <Avatar
                src={blog.userImage}
                name={blog.authorName}
                size={42}
              />
              <div>
                <p className="font-semibold text-slate-800">{blog.authorName}</p>
                <p className="text-xs text-slate-500">{formatDate(blog.createdAt)}</p>
              </div>
            </div>
            <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
              {blog.blog}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
