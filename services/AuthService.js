// services/AuthService.js
import { decodeJwt, isExpired } from "@/utils/auth";
import { User } from "@/models/User";

export class AuthService {
  constructor(http, tokenStorage) {
    this.http = http;
    this.tokenStorage = tokenStorage;
  }

  register(payload) {
    return this.http.post("/auth/register", payload);
  }

  async login(payload) {
    const data = await this.http.post("/auth/login", payload);
    // Accept several common response shapes: {token}, {data:{token}}, {accessToken}.
    const token =
      data?.token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken;
    if (token) this.tokenStorage.set(token);
    return { ...data, token };
  }

  forgotPassword(payload) {
    return this.http.post("/auth/forgot-password", payload);
  }

  resetPassword(token, payload) {
    return this.http.patch(`/auth/reset-password/${encodeURIComponent(token)}`, payload);
  }

  logout() {
    this.tokenStorage.set(null);
  }

  // Reads the current session from the stored token: decodes/validates it and derives an
  // optimistic User, absorbing the JWT-decode/expiry orchestration that used to live in
  // AuthContext's bootstrap().
  getSession() {
    const token = this.tokenStorage.get();
    if (!token || isExpired(token)) {
      this.tokenStorage.set(null);
      return { valid: false, user: null };
    }
    return { valid: true, user: User.fromJwtPayload(decodeJwt(token)) };
  }
}
