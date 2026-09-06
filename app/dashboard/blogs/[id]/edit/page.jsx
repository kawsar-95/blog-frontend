"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { blogService } from "@/services";
import BlogForm from "@/components/BlogForm";
import Loader from "@/components/Loader";
import { useToast } from "@/contexts/ToastContext";
import Alert from "@/components/Alert";

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const b = await blogService.get(id);
        if (!cancelled) setInitial(b);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Blog not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(form) {
    await blogService.update(id, form);
    toast.success("Blog updated");
    router.push("/dashboard/blogs");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Blog</h1>
          <p className="text-sm text-slate-600">Update your post and republish.</p>
        </div>
        <Link href="/dashboard/blogs" className="btn-secondary">← Back</Link>
      </div>
      <div className="card">
        {loading ? (
          <Loader label="Loading blog..." />
        ) : error || !initial ? (
          <Alert type="error">{error || "Blog not found."}</Alert>
        ) : (
          <BlogForm
            initial={{
              blogTitle: initial.blogTitle,
              category: initial.category,
              blog: initial.blog,
            }}
            onSubmit={handleSubmit}
            submitLabel="Update Blog"
          />
        )}
      </div>
    </div>
  );
}
