"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { blogService } from "@/services/blog.service";
import BlogForm from "@/components/BlogForm";
import { useToast } from "@/contexts/ToastContext";

export default function CreateBlogPage() {
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(form) {
    const data = await blogService.create(form);
    toast.success("Blog published!");
    const id = data?.blog?._id || data?.data?.blog?._id || data?.blog?.id;
    router.push(id ? `/blogs/${id}` : "/dashboard/blogs");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Blog</h1>
          <p className="text-sm text-slate-600">Share something interesting with the community.</p>
        </div>
        <Link href="/dashboard/blogs" className="btn-secondary">← Back</Link>
      </div>
      <div className="card">
        <BlogForm onSubmit={handleSubmit} submitLabel="Publish Blog" />
      </div>
    </div>
  );
}