"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useBlogs } from "@/hooks/useBlogs";
import { formatDate } from "@/utils/format";
import { SkeletonCard } from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import Alert from "@/components/Alert";
import { Th, Td } from "@/components/Table";

export default function MyBlogsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { blogs, loading, error, remove } = useBlogs({ scope: "mine" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast.success("Blog deleted");
      setDeleteTarget(null);
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

      {error && <Alert type="error">{error}</Alert>}

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
                  return (
                    <tr key={id} className="hover:bg-slate-50">
                      <Td>
                        <Link href={`/blogs/${id}`} className="font-medium text-slate-800 hover:text-brand-700">
                          {b.blogTitle}
                        </Link>
                      </Td>
                      <Td><span className="badge">{b.category || "General"}</span></Td>
                      <Td>{b.authorName}</Td>
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
