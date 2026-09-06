// lib/http/TokenStorage.js
const DEFAULT_KEY = "blogspace_token";

export class TokenStorage {
  constructor(key = DEFAULT_KEY) {
    this.key = key;
  }

  get() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(this.key);
  }

  set(token) {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(this.key, token);
    else window.localStorage.removeItem(this.key);
  }

  clear() {
    this.set(null);
  }
}
