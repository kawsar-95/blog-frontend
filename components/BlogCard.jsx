"use client";
import Link from "next/link";
import Avatar from "./Avatar";
import { formatDate, truncate } from "@/utils/format";

export default function BlogCard({ blog }) {
  if (!blog) return null;
  const author =
    [blog.userFirstName, blog.userLastName].filter(Boolean).join(" ") ||
    blog.author ||
    "Unknown";
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="badge">{blog.category || "General"}</span>
        <span className="text-xs text-slate-500">{formatDate(blog.createdAt)}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
        <Link href={`/blogs/${blog._id || blog.id}`}>{blog.blogTitle}</Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm text-slate-600">
        {truncate(blog.blog, 180)}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={blog.userImage || blog.authorImage}
            name={author}
            size={36}
          />
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800">{author}</p>
            <p className="text-xs text-slate-500">Author</p>
          </div>
        </div>
        <Link href={`/blogs/${blog._id || blog.id}`} className="link text-sm font-semibold">
          Read More →
        </Link>
      </div>
    </article>
  );
}