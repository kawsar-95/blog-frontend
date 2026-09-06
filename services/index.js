// services/index.js — composition root.
// Builds one HttpClient + TokenStorage and injects them into the service classes, so every
// consumer can keep importing plain singletons without knowing about the constructors.
import { HttpClient } from "@/lib/http/HttpClient";
import { TokenStorage } from "@/lib/http/TokenStorage";
import { AuthService } from "./AuthService";
import { BlogService } from "./BlogService";
import { UserService } from "./UserService";

const tokenStorage = new TokenStorage();
const httpClient = new HttpClient({ tokenStorage });

export const authService = new AuthService(httpClient, tokenStorage);
export const blogService = new BlogService(httpClient);
export const userService = new UserService(httpClient);

export { httpClient, tokenStorage };
