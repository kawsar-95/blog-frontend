// utils/adapter.js
// Bridges field-name differences between this backend and what the UI expects.
// Backend (NK22278 blog-api) returns:
//   user: { id, firstname, lastname, email, isActive, role, createAt, ... }
//   blog: { id, blogTitle, blog, category, userId, author: {firstname,lastname}, createAt, ... }
// UI expects:
//   user: { _id|id, firstName, lastName, email, isActive, role, createdAt }
//   blog: { _id|id, blogTitle, blog, category, createdAt, userFirstName, userLastName }

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (obj?.[k] !== undefined ? acc : k.includes(".") ? acc : acc), {});

function adaptUser(u) {
  if (!u) return u;
  return {
    ...u,
    _id: u._id ?? u.id,
    firstName: u.firstName ?? u.firstname ?? "",
    lastName: u.lastName ?? u.lastname ?? "",
    createdAt: u.createdAt ?? u.createAt ?? u.updatedAt ?? u.updateAt,
    profileImage: u.profileImage ?? u.image ?? null,
  };
}

function adaptBlog(b) {
  if (!b) return b;
  const author = b.author || b.user || null;
  return {
    ...b,
    _id: b._id ?? b.id,
    createdAt: b.createdAt ?? b.createAt ?? b.updatedAt ?? b.updateAt,
    category: b.category ?? "General",
    userFirstName: b.userFirstName ?? author?.firstname ?? author?.firstName ?? "",
    userLastName: b.userLastName ?? author?.lastname ?? author?.lastName ?? "",
    userImage: b.userImage ?? b.authorImage ?? author?.image ?? null,
  };
}

function adaptUserList(payload) {
  // Accept {users}, {data: {users}}, {data}, or array
  if (Array.isArray(payload)) return payload.map(adaptUser);
  const list = payload?.users ?? payload?.data?.users ?? payload?.data ?? [];
  return Array.isArray(list) ? list.map(adaptUser) : [];
}

function adaptBlogList(payload) {
  if (Array.isArray(payload)) return payload.map(adaptBlog);
  const list = payload?.blogs ?? payload?.data?.blogs ?? payload?.data ?? [];
  return Array.isArray(list) ? list.map(adaptBlog) : [];
}

module.exports = { adaptUser, adaptBlog, adaptUserList, adaptBlogList };