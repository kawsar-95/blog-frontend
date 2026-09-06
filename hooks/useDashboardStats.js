"use client";
import { blogService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "./useAsync";

// Backs app/dashboard/page.jsx. Fetch errors are intentionally swallowed (as before) — the
// empty-state UI handles that case, this hook just doesn't surface a message for it.
export function useDashboardStats() {
  const { user } = useAuth();

  const { data, loading } = useAsync(
    async () => {
      const list = await blogService.list();
      const mine = user?.id ? list.filter((b) => b.isOwnedBy(user.id)) : [];
      return { total: list.length, mine: mine.length, recent: list.slice(0, 3) };
    },
    { deps: [user?.id] }
  );

  return {
    stats: { total: data?.total ?? 0, mine: data?.mine ?? 0 },
    recent: data?.recent ?? [],
    loading,
  };
}
