"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { LoginValidator } from "@/validators/LoginValidator";
import { Spinner } from "@/components/Loader";
import Alert from "@/components/Alert";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
    const { errors: errs, isValid } = LoginValidator.validate(form);
    setErrors(errs);
    if (!isValid) return;
    setSubmitting(true);
    try {
      await authService.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      await login();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e) {
      setServerError(e?.message || "Invalid email or password");
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in to continue to your dashboard.</p>
        </div>

        <form onSubmit={handle} className="card space-y-4">
          {serverError && <Alert type="error">{serverError}</Alert>}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label !mb-0">Password</label>
              <Link href="/forgot-password" className="text-xs link">Forgot Password?</Link>
            </div>
            <input
              type="password"
              className="input mt-1.5"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <><Spinner size={14} /> Signing in...</> : "Login"}
          </button>
          <p className="text-center text-sm text-slate-600">
            New to BlogSpace?{" "}
            <Link href="/register" className="link font-semibold">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
