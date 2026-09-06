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
import { getToken, setToken as saveToken } from "@/utils/api";
import { decodeJwt, isExpired, roleFromToken } from "@/utils/auth";
import { userService } from "@/services/user.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap auth state from localStorage on first mount.
  const bootstrap = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token || isExpired(token)) {
      saveToken(null);
      setUser(null);
      setProfileImage(null);
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    if (payload) {
      setUser({
        id: payload.id || payload._id || payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: roleFromToken(token),
      });
    }
    try {
      const u = await userService.profile();
      if (u && (u.firstName || u.email)) {
        setUser((prev) => ({
          ...prev,
          id: u._id || u.id || prev?.id,
          firstName: u.firstName ?? prev?.firstName,
          lastName: u.lastName ?? prev?.lastName,
          email: u.email ?? prev?.email,
          role: u.role ?? prev?.role,
        }));
        setProfileImage(u.image || u.profileImage || null);
      }
    } catch (e) {
      // 401/403 means the token is no longer valid; drop it.
      if (e?.status === 401 || e?.status === 403) {
        saveToken(null);
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
    saveToken(null);
    setUser(null);
    setProfileImage(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const u = await userService.profile();
      if (u && (u.firstName || u.email)) {
        setUser((prev) => ({
          ...prev,
          id: u._id || u.id || prev?.id,
          firstName: u.firstName ?? prev?.firstName,
          lastName: u.lastName ?? prev?.lastName,
          email: u.email ?? prev?.email,
          role: u.role ?? prev?.role,
        }));
        setProfileImage(u.image || u.profileImage || null);
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
      isAdmin: (user?.role || "").toString().toLowerCase() === "admin",
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