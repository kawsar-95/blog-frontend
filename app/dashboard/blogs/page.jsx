"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { blogService } from "@/services/blog.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { formatDate } from "@/utils/format";
import { SkeletonCard } from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function MyBlogsPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let list = await blogService.list();
      if (!isAdmin && user?.id) {
        list = list.filter(
          (b) => (b.userId || b.authorId || b.user?._id) === user.id
        );
      }
      setBlogs(list);
    } catch (e) {
      setError(e?.message || "Could not load blogs");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.id]);

  useEffect(() => { load(); }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await blogService.remove(deleteTarget._id || deleteTarget.id);
      toast.success("Blog deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e?.message || "Could not delete blog");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? "All Blogs" : "My Blogs"}
          </h1>
          <p className="text-sm text-slate-600">
            {isAdmin
              ? "Manage every blog on the platform."
              : "Edit or delete blogs you have authored."}
          </p>
        </div>
        <Link href="/dashboard/blogs/create" className="btn-primary">
          ✍️ Create Blog
        </Link>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          title={isAdmin ? "No blogs yet" : "You haven't created any blogs yet"}
          message="Publish your first blog to see it here."
          icon="📝"
          action={
            <Link href="/dashboard/blogs/create" className="btn-primary">
              Create your first blog
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Author</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((b) => {
                  const id = b._id || b.id;
                  const author =
                    [b.userFirstName, b.userLastName].filter(Boolean).join(" ") ||
                    b.author ||
                    "Unknown";
                  return (
                    <tr key={id} className="hover:bg-slate-50">
                      <Td>
                        <Link href={`/blogs/${id}`} className="font-medium text-slate-800 hover:text-brand-700">
                          {b.blogTitle}
                        </Link>
                      </Td>
                      <Td><span className="badge">{b.category || "General"}</span></Td>
                      <Td>{author}</Td>
                      <Td className="text-slate-500">{formatDate(b.createdAt)}</Td>
                      <Td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            className="btn-secondary !py-1.5 !px-3 text-xs"
                            onClick={() => router.push(`/dashboard/blogs/${id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger !py-1.5 !px-3 text-xs"
                            onClick={() => setDeleteTarget(b)}
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete blog?"
        message={`Are you sure you want to delete "${deleteTarget?.blogTitle}"? This cannot be undone.`}
        confirmText="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 " + className}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={"px-4 py-3 align-middle " + className}>{children}</td>;
}