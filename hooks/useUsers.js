"use client";
import { useCallback } from "react";
import { userService } from "@/services";
import { useAsync } from "./useAsync";

// Backs app/admin/users/page.jsx.
export function useUsers() {
  const { data, loading, error, reload } = useAsync(() => userService.list(), { deps: [] });

  const setStatus = useCallback(
    async (id, isActive) => {
      await userService.setStatus(id, isActive);
      await reload();
    },
    [reload]
  );

  return { users: data || [], loading, error, setStatus, reload };
}
