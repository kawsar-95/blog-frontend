// lib/http/HttpClient.js
import { API_URL } from "./config";

export class HttpClient {
  constructor({ baseUrl = API_URL, tokenStorage } = {}) {
    this.baseUrl = baseUrl;
    this.tokenStorage = tokenStorage;
  }

  async request(method, path, { body, auth = false, headers = {}, isFormData = false } = {}) {
    const finalHeaders = { Accept: "application/json", ...headers };
    if (!isFormData && body !== undefined) finalHeaders["Content-Type"] = "application/json";
    if (auth) {
      const token = this.tokenStorage?.get();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    const init = { method, headers: finalHeaders };
    if (method === "GET") init.cache = "no-store";
    if (body !== undefined) init.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(`${this.baseUrl}${path}`, init);
    return this.#handle(res);
  }

  async #handle(res) {
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message =
        (data && (data.message || data.error || data.msg)) ||
        res.statusText ||
        `Request failed (${res.status})`;
      const err = new Error(typeof message === "string" ? message : "Request failed");
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  get(path, opts) {
    return this.request("GET", path, opts);
  }
  post(path, body, opts) {
    return this.request("POST", path, { ...opts, body });
  }
  put(path, body, opts) {
    return this.request("PUT", path, { ...opts, body });
  }
  patch(path, body, opts) {
    return this.request("PATCH", path, { ...opts, body });
  }
  delete(path, opts) {
    return this.request("DELETE", path, opts);
  }
  patchForm(path, formData, opts) {
    return this.request("PATCH", path, {
      ...opts,
      auth: opts?.auth ?? true,
      body: formData,
      isFormData: true,
    });
  }
}
