"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authService } from "@/services";
import { ResetPasswordValidator } from "@/validators/ResetPasswordValidator";
import { useToast } from "@/contexts/ToastContext";
import { Spinner } from "@/components/Loader";
import Alert from "@/components/Alert";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
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
    const { errors: errs, isValid } = ResetPasswordValidator.validate(form);
    setErrors(errs);
    if (!isValid) return;
    setSubmitting(true);
    try {
      await authService.resetPassword(token, { password: form.password });
      toast.success("Password successfully changed.");
      router.push("/login");
    } catch (e) {
      setServerError(e?.message || "Could not reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">B</span>
            <span>BlogSpace</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-600">Choose a strong new password.</p>
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
              autoComplete="new-password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <><Spinner size={14} /> Resetting...</> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
