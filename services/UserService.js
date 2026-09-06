// services/UserService.js
import { User } from "@/models/User";
import { unwrapEnvelope } from "@/lib/envelope";

export class UserService {
  constructor(http) {
    this.http = http;
  }

  // Admin: list users
  async list() {
    const data = await this.http.get("/users", { auth: true });
    return User.fromApiList(data);
  }

  // Admin: get a user by id
  async get(id) {
    const data = await this.http.get(`/users/${encodeURIComponent(id)}`, { auth: true });
    return User.fromApi(unwrapEnvelope(data, "user"));
  }

  // Admin: change user status
  setStatus(id, isActive) {
    return this.http.patch(`/users/${encodeURIComponent(id)}/status`, { isActive }, { auth: true });
  }

  // Current user profile
  async profile() {
    const data = await this.http.get("/users/profile", { auth: true });
    return User.fromApi(unwrapEnvelope(data, "user"));
  }

  // Update current profile (backend uses firstname/lastname)
  updateProfile(form) {
    const payload = {
      firstname: form.firstName ?? form.firstname,
      lastname: form.lastName ?? form.lastname,
    };
    return this.http.put("/users/profile/update", payload, { auth: true });
  }

  // Upload profile image (multipart) — backend may not expose this endpoint.
  uploadImage(file) {
    const fd = new FormData();
    fd.append("image", file);
    return this.http.patchForm("/users/profile/image", fd, { auth: true });
  }

  // Change password
  changePassword(password) {
    return this.http.patch("/users/password", { password }, { auth: true });
  }
}
