// models/User.js
import { unwrapEnvelope } from "@/lib/envelope";
import { initialsOf } from "@/utils/format";

export class User {
  constructor({
    id = null,
    firstName = "",
    lastName = "",
    email = "",
    role = null,
    profileImage = null,
    createdAt = null,
    isActive,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.profileImage = profileImage;
    this.createdAt = createdAt;
    this.isActive = isActive;
  }

  // Bridges field-name differences between the backend and what the UI expects
  // (firstname/createAt/etc. -> firstName/createdAt/etc.), replacing utils/adapter.js's adaptUser.
  static fromApi(raw) {
    if (!raw) return null;
    return new User({
      id: raw._id ?? raw.id,
      firstName: raw.firstName ?? raw.firstname ?? "",
      lastName: raw.lastName ?? raw.lastname ?? "",
      email: raw.email ?? "",
      role: raw.role ?? null,
      profileImage: raw.profileImage ?? raw.image ?? null,
      createdAt: raw.createdAt ?? raw.createAt ?? raw.updatedAt ?? raw.updateAt ?? null,
      isActive: raw.isActive,
    });
  }

  static fromApiList(payload) {
    const list = unwrapEnvelope(payload, "users");
    return Array.isArray(list) ? list.map(User.fromApi) : [];
  }

  static fromJwtPayload(payload) {
    if (!payload) return null;
    return new User({
      id: payload.id || payload._id || payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role || payload.roles || null,
    });
  }

  get fullName() {
    return [this.firstName, this.lastName].filter(Boolean).join(" ") || this.email || "";
  }

  get initials() {
    return initialsOf(this.fullName);
  }

  get isAdmin() {
    return (this.role || "").toString().toLowerCase() === "admin";
  }

  // Compatibility alias so existing `u._id || u.id` call sites keep working unchanged.
  get _id() {
    return this.id;
  }

  // Reconciles the optimistic JWT-derived user with a freshly-fetched profile, keeping
  // whichever side has a value for each field (mirrors the merge AuthContext used to do inline).
  merge(partial) {
    const src = (partial instanceof User ? partial : User.fromApi(partial)) ?? {};
    return new User({
      id: src.id ?? this.id,
      firstName: src.firstName ?? this.firstName,
      lastName: src.lastName ?? this.lastName,
      email: src.email ?? this.email,
      role: src.role ?? this.role,
      profileImage: src.profileImage ?? this.profileImage,
      createdAt: src.createdAt ?? this.createdAt,
      isActive: src.isActive ?? this.isActive,
    });
  }
}
