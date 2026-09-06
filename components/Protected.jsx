"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "./Loader";

/**
 * Wraps a page that requires authentication.
 * - Redirects to /login if not authenticated
 * - Redirects to /dashboard if adminOnly and not admin
 */
export default function Protected({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, isAdmin, adminOnly, router]);

  if (loading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader label={loading ? "Checking session..." : "Redirecting..."} />
      </div>
    );
  }
  return children;
}