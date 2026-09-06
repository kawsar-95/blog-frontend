// services/blog.service.js
import { apiGet, apiPost, apiPut, apiDelete } from "@/utils/api";
import { adaptBlog, adaptBlogList } from "@/utils/adapter";

function qs(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.append(k, v);
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export const blogService = {
  // GET /api/blogs?title=&category=
  list: async ({ title, category } = {}) => {
    const data = await apiGet(`/blogs${qs({ title, category })}`);
    return adaptBlogList(data);
  },

  get: async (id) => {
    const data = await apiGet(`/blogs/${encodeURIComponent(id)}`);
    const b = data?.blog || data?.data?.blog || data?.data || data;
    return adaptBlog(b);
  },

  create: (payload) => apiPost("/blogs/create", payload, { auth: true }),

  update: (id, payload) =>
    apiPut(`/blogs/update/${encodeURIComponent(id)}`, payload, { auth: true }),

  remove: (id) =>
    apiDelete(`/blogs/delete/${encodeURIComponent(id)}`, { auth: true }),
};