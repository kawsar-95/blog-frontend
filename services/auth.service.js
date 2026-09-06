// services/auth.service.js
import { apiPost, apiPatch, setToken } from "@/utils/api";

export const authService = {
  register: (payload) => apiPost("/auth/register", payload),

  login: async (payload) => {
    const data = await apiPost("/auth/login", payload);
    // Accept several common response shapes: {token}, {data:{token}}, {accessToken}
    const token =
      data?.token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken;
    if (token) setToken(token);
    return { ...data, token };
  },

  forgotPassword: (payload) => apiPost("/auth/forgot-password", payload),

  resetPassword: (token, payload) =>
    apiPatch(`/auth/reset-password/${encodeURIComponent(token)}`, payload),

  logout: () => setToken(null),
};