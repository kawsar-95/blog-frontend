"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services";
import { ForgotPasswordValidator } from "@/validators/ForgotPasswordValidator";
import { useToast } from "@/contexts/ToastContext";
import { Spinner } from "@/components/Loader";
import Alert from "@/components/Alert";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handle(e) {
    e.preventDefault();
    setServerError("");
    const { errors: errs, isValid } = ForgotPasswordValidator.validate({ email });
    setErrors(errs);
    if (!isValid) return;
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setDone(true);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (e) {
      setServerError(e?.message || "Could not send reset link");
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Forgot your password?</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handle} className="card space-y-4">
          {done && <Alert type="success">Password reset link sent. Please check your inbox.</Alert>}
          {serverError && <Alert type="error">{serverError}</Alert>}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <><Spinner size={14} /> Sending...</> : "Send Reset Link"}
          </button>
          <p className="text-center text-sm text-slate-600">
            Remembered it?{" "}
            <Link href="/login" className="link font-semibold">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
