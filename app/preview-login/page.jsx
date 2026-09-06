"use client";

// TEMP preview-only helper: sets a fake JWT so the auth-guarded pages can
// be screenshotted/audited without a real login. DELETE BEFORE SUBMISSION.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

const b64 = (o) => {
  const s = JSON.stringify(o);
  if (typeof btoa === "function")
    return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return Buffer.from(s).toString("base64url");
};

export default function PreviewLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const role = url.searchParams.get("role") || "admin";
    const next = url.searchParams.get("next") || "/dashboard";
    const payload = b64({
      id: "1",
      firstname: role === "admin" ? "System" : "John",
      lastname: role === "admin" ? "Admin" : "Doe",
      email: role === "admin" ? "admin@example.com" : "john@example.com",
      role,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const header = b64({ alg: "HS256", typ: "JWT" });
    const sig = "preview-signature-not-verified";
    localStorage.setItem("blogspace_token", `${header}.${payload}.${sig}`);
    router.replace(next);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader label="Signing you in for preview..." />
    </div>
  );
}