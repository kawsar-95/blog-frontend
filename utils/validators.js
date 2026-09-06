// utils/validators.js — small, dependency-free validators.

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(v) {
  return emailRegex.test(String(v || "").trim());
}

export function isNonEmpty(v) {
  return v !== undefined && v !== null && String(v).trim().length > 0;
}

export function minLen(v, n) {
  return String(v || "").length >= n;
}

// Returns an object of errors keyed by field name.
export function validateRegister(form) {
  const errors = {};
  if (!isNonEmpty(form.firstName)) errors.firstName = "First name is required";
  if (!isNonEmpty(form.lastName)) errors.lastName = "Last name is required";
  if (!isEmail(form.email)) errors.email = "Enter a valid email";
  if (!minLen(form.password, 6)) errors.password = "Password must be at least 6 characters";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
}

export function validateLogin(form) {
  const errors = {};
  if (!isEmail(form.email)) errors.email = "Enter a valid email";
  if (!isNonEmpty(form.password)) errors.password = "Password is required";
  return errors;
}

export function validateForgot(form) {
  const errors = {};
  if (!isEmail(form.email)) errors.email = "Enter a valid email";
  return errors;
}

export function validateReset(form) {
  const errors = {};
  if (!minLen(form.password, 6)) errors.password = "Password must be at least 6 characters";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
}

export function validateBlog(form) {
  const errors = {};
  if (!isNonEmpty(form.blogTitle) || String(form.blogTitle).trim().length < 3)
    errors.blogTitle = "Title must be at least 3 characters";
  if (!isNonEmpty(form.category)) errors.category = "Category is required";
  if (!isNonEmpty(form.blog) || String(form.blog).trim().length < 10)
    errors.blog = "Blog content must be at least 10 characters";
  return errors;
}

export function validateProfile(form) {
  const errors = {};
  if (!isNonEmpty(form.firstName)) errors.firstName = "First name is required";
  if (!isNonEmpty(form.lastName)) errors.lastName = "Last name is required";
  return errors;
}

export function validatePasswordChange(form) {
  const errors = {};
  if (!minLen(form.password, 6)) errors.password = "Password must be at least 6 characters";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
}

// Image validation — accepts only images, <= 2 MB.
export function validateImage(file) {
  if (!file) return "Please select an image";
  if (!file.type.startsWith("image/")) return "File must be an image";
  if (file.size > 2 * 1024 * 1024) return "Image must be smaller than 2 MB";
  return null;
}