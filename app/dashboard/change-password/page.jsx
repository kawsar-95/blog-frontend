"use client";

import { useState } from "react";
import Link from "next/link";
import { userService } from "@/services";
import { PasswordChangeValidator } from "@/validators/PasswordChangeValidator";
import { useToast } from "@/contexts/ToastContext";
import { Spinner } from "@/components/Loader";
import Alert from "@/components/Alert";

export default function ChangePasswordPage() {
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function handle(e) {
    e.preventDefault();
    setServerError("");
    const { errors: errs, isValid } = PasswordChangeValidator.validate(form);
    setErrors(errs);
    if (!isValid) return;
    setSubmitting(true);
    try {
      await userService.changePassword(form.password);
      toast.success("Password updated");
      setForm({ password: "", confirmPassword: "" });
    } catch (e) {
      setServerError(e?.message || "Could not change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
          <p className="text-sm text-slate-600">Choose a strong password you haven&apos;t used before.</p>
        </div>
        <Link href="/dashboard/profile" className="btn-secondary">← Back</Link>
      </div>

      <form onSubmit={handle} className="card space-y-4">
        {serverError && <Alert type="error">{serverError}</Alert>}
        <div>
          <label className="label">New Password</label>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input
            type="password"
            className="input"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? <><Spinner size={14} /> Updating...</> : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
