// services/user.service.js
import { apiGet, apiPut, apiPatch, apiPatchForm } from "@/utils/api";
import { adaptUser, adaptUserList } from "@/utils/adapter";

export const userService = {
  // Admin: list users
  list: async () => {
    const data = await apiGet("/users", { auth: true });
    return adaptUserList(data);
  },

  // Admin: get a user by id
  get: async (id) => {
    const data = await apiGet(`/users/${encodeURIComponent(id)}`, { auth: true });
    const u = data?.user || data?.data?.user || data?.data || data;
    return adaptUser(u);
  },

  // Admin: change user status
  setStatus: (id, isActive) =>
    apiPatch(`/users/${encodeURIComponent(id)}/status`, { isActive }, { auth: true }),

  // Current user profile
  profile: async () => {
    const data = await apiGet("/users/profile", { auth: true });
    const u = data?.user || data?.data?.user || data?.data || data;
    return adaptUser(u);
  },

  // Update current profile (backend uses firstname/lastname)
  updateProfile: (form) => {
    const payload = {
      firstname: form.firstName ?? form.firstname,
      lastname: form.lastName ?? form.lastname,
    };
    return apiPut("/users/profile/update", payload, { auth: true });
  },

  // Upload profile image (multipart) — backend may not expose this endpoint.
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiPatchForm("/users/profile/image", fd, { auth: true });
  },

  // Change password
  changePassword: (password) =>
    apiPatch("/users/password", { password }, { auth: true }),
};