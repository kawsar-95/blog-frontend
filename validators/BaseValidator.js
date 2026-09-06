// validators/BaseValidator.js — shared rule primitives for the per-form validators.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class BaseValidator {
  static isNonEmpty(v) {
    return v !== undefined && v !== null && String(v).trim().length > 0;
  }

  static isEmail(v) {
    return emailRegex.test(String(v || "").trim());
  }

  static minLength(v, n) {
    return String(v || "").length >= n;
  }

  static matches(a, b) {
    return a === b;
  }

  static result(errors) {
    return { errors, isValid: Object.keys(errors).length === 0 };
  }
}
