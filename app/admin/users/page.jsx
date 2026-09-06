"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/utils/format";
import { SkeletonCard } from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import Avatar from "@/components/Avatar";
import Alert from "@/components/Alert";
import Protected from "@/components/Protected";
import { Th, Td } from "@/components/Table";

function AdminUsersInner() {
  const toast = useToast();
  const { users, loading, error, setStatus } = useUsers();
  const [target, setTarget] = useState(null);

  async function toggleStatus() {
    if (!target) return;
    const next = !target.isActive;
    try {
      await setStatus(target.id, next);
      toast.success(`User ${next ? "activated" : "deactivated"}`);
      setTarget(null);
    } catch (e) {
      toast.error(e?.message || "Could not update status");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-600">Manage every account on the platform.</p>
      </header>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="No accounts have been created yet." icon="👥" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const id = u._id || u.id;
                  const isActive = !!u.isActive;
                  return (
                    <tr key={id} className="hover:bg-slate-50">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar src={u.profileImage} name={u.fullName} size={36} />
                          <div>
                            <p className="font-medium text-slate-800">{u.fullName || "—"}</p>
                            <p className="text-xs text-slate-500">{formatDate(u.createdAt)}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>{u.email}</Td>
                      <Td>
                        <span className={"badge " + (u.role?.toLowerCase() === "admin" ? "!bg-amber-100 !text-amber-800" : "")}>
                          {u.role || "User"}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                            (isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600")
                          }
                        >
                          <span className={"h-1.5 w-1.5 rounded-full " + (isActive ? "bg-emerald-500" : "bg-slate-400")} />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td className="text-slate-500">{formatDate(u.createdAt)}</Td>
                      <Td className="text-right">
                        <button
                          className={isActive ? "btn-danger !py-1.5 !px-3 text-xs" : "btn-primary !py-1.5 !px-3 text-xs"}
                          onClick={() => setTarget(u)}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
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
        open={!!target}
        title={target?.isActive ? "Deactivate user?" : "Activate user?"}
        message={
          target?.isActive
            ? `${target?.fullName || "This user"} will not be able to log in.`
            : `${target?.fullName || "This user"} will regain access.`
        }
        confirmText={target?.isActive ? "Deactivate" : "Activate"}
        danger={!!target?.isActive}
        onCancel={() => setTarget(null)}
        onConfirm={toggleStatus}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Protected adminOnly>
      <AdminUsersInner />
    </Protected>
  );
}
