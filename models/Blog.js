// models/Blog.js
import { unwrapEnvelope } from "@/lib/envelope";

export class Blog {
  constructor({
    id = null,
    blogTitle = "",
    blog = "",
    category = "General",
    createdAt = null,
    userId = null,
    userFirstName = "",
    userLastName = "",
    userImage = null,
    authorDisplay = "",
  } = {}) {
    this.id = id;
    this.blogTitle = blogTitle;
    this.blog = blog;
    this.category = category;
    this.createdAt = createdAt;
    this.userId = userId;
    this.userFirstName = userFirstName;
    this.userLastName = userLastName;
    this.userImage = userImage;
    this.authorDisplay = authorDisplay;
  }

  // Replaces utils/adapter.js's adaptBlog.
  static fromApi(raw) {
    if (!raw) return null;
    const author = raw.author || raw.user || null;
    return new Blog({
      id: raw._id ?? raw.id,
      blogTitle: raw.blogTitle,
      blog: raw.blog,
      category: raw.category ?? "General",
      createdAt: raw.createdAt ?? raw.createAt ?? raw.updatedAt ?? raw.updateAt ?? null,
      userId: raw.userId ?? raw.authorId ?? author?._id ?? author?.id ?? null,
      userFirstName: raw.userFirstName ?? author?.firstname ?? author?.firstName ?? "",
      userLastName: raw.userLastName ?? author?.lastname ?? author?.lastName ?? "",
      userImage: raw.userImage ?? raw.authorImage ?? author?.image ?? null,
      authorDisplay: typeof raw.author === "string" ? raw.author : "",
    });
  }

  static fromApiList(payload) {
    const list = unwrapEnvelope(payload, "blogs");
    return Array.isArray(list) ? list.map(Blog.fromApi) : [];
  }

  get authorName() {
    return (
      [this.userFirstName, this.userLastName].filter(Boolean).join(" ") ||
      this.authorDisplay ||
      "Unknown"
    );
  }

  // Compatibility alias so existing `b._id || b.id` call sites keep working unchanged.
  get _id() {
    return this.id;
  }

  isOwnedBy(userId) {
    return !!userId && this.userId === userId;
  }
}
