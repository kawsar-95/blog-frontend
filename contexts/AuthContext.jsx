// contexts/AuthContext.jsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { authService, userService } from "@/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap auth state from localStorage on first mount.
  const bootstrap = useCallback(async () => {
    setLoading(true);
    const session = authService.getSession();
    if (!session.valid) {
      setUser(null);
      setProfileImage(null);
      setLoading(false);
      return;
    }
    setUser(session.user);
    try {
      const fresh = await userService.profile();
      if (fresh && (fresh.firstName || fresh.email)) {
        setUser((prev) => {
          const base = prev || session.user;
          return base ? base.merge(fresh) : fresh;
        });
        setProfileImage(fresh.profileImage || null);
      }
    } catch (e) {
      // 401/403 means the token is no longer valid; drop it.
      if (e?.status === 401 || e?.status === 403) {
        authService.logout();
        setUser(null);
        setProfileImage(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async () => {
    await bootstrap();
  }, [bootstrap]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setProfileImage(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const fresh = await userService.profile();
      if (fresh && (fresh.firstName || fresh.email)) {
        setUser((prev) => (prev ? prev.merge(fresh) : fresh));
        setProfileImage(fresh.profileImage || null);
      }
    } catch (e) {
      // ignore — surfaced in the caller
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      profileImage,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin ?? false,
      login,
      logout,
      refreshProfile,
    }),
    [user, profileImage, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
