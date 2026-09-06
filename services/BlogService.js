// services/BlogService.js
import { Blog } from "@/models/Blog";
import { unwrapEnvelope } from "@/lib/envelope";

function qs(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.append(k, v);
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export class BlogService {
  constructor(http) {
    this.http = http;
  }

  // GET /api/blogs?title=&category=
  async list({ title, category } = {}) {
    const data = await this.http.get(`/blogs${qs({ title, category })}`);
    return Blog.fromApiList(data);
  }

  // Absorbs the ownership filter that used to be duplicated inline across dashboard pages.
  async listMine(userId, params = {}) {
    const all = await this.list(params);
    return userId ? all.filter((b) => b.isOwnedBy(userId)) : all;
  }

  async get(id) {
    const data = await this.http.get(`/blogs/${encodeURIComponent(id)}`);
    return Blog.fromApi(unwrapEnvelope(data, "blog"));
  }

  async create(payload) {
    const data = await this.http.post("/blogs/create", payload, { auth: true });
    return Blog.fromApi(unwrapEnvelope(data, "blog"));
  }

  async update(id, payload) {
    const data = await this.http.put(`/blogs/update/${encodeURIComponent(id)}`, payload, { auth: true });
    return Blog.fromApi(unwrapEnvelope(data, "blog"));
  }

  remove(id) {
    return this.http.delete(`/blogs/delete/${encodeURIComponent(id)}`, { auth: true });
  }
}
