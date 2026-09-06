"use client";
import { useState } from "react";
import { validateBlog } from "@/utils/validators";
import { Spinner } from "./Loader";

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

export default function BlogForm({ initial, onSubmit, submitLabel = "Publish Blog" }) {
  const [form, setForm] = useState({
    blogTitle: initial?.blogTitle || "",
    category: initial?.category || "",
    blog: initial?.blog || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handle(e) {
    e.preventDefault();
    setServerError("");
    const errs = validateBlog(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (e) {
      setServerError(e?.message || "Could not save blog");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverError}
        </div>
      )}

      <div>
        <label className="label">Blog Title</label>
        <input
          className="input"
          value={form.blogTitle}
          onChange={(e) => set("blogTitle", e.target.value)}
          placeholder="Introduction to Playwright"
        />
        {errors.blogTitle && <p className="mt-1 text-xs text-red-600">{errors.blogTitle}</p>}
      </div>

      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">Select a category</option>
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label className="label">Blog Content</label>
        <textarea
          className="input min-h-[220px] resize-y"
          value={form.blog}
          onChange={(e) => set("blog", e.target.value)}
          placeholder="Write your blog content here..."
        />
        {errors.blog && <p className="mt-1 text-xs text-red-600">{errors.blog}</p>}
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? <><Spinner size={14} /> {submitLabel}...</> : submitLabel}
        </button>
      </div>
    </form>
  );
}