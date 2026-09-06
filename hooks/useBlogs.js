"use client";
import { useCallback } from "react";
import { blogService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "./useAsync";

// Backs app/dashboard/blogs/page.jsx: scope "mine" shows only the current user's blogs unless
// they're an admin (matches the ownership filter that used to be duplicated inline on the page).
export function useBlogs({ scope = "all" } = {}) {
  const { user, isAdmin } = useAuth();

  const { data, loading, error, reload } = useAsync(
    () => (scope === "mine" && !isAdmin ? blogService.listMine(user?.id) : blogService.list()),
    { deps: [scope, isAdmin, user?.id] }
  );

  const remove = useCallback(
    async (id) => {
      await blogService.remove(id);
      await reload();
    },
    [reload]
  );

  return { blogs: data || [], loading, error, remove, reload };
}
