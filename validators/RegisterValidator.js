import { BaseValidator } from "./BaseValidator";

export class RegisterValidator extends BaseValidator {
  static validate(form) {
    const errors = {};
    if (!this.isNonEmpty(form.firstName)) errors.firstName = "First name is required";
    if (!this.isNonEmpty(form.lastName)) errors.lastName = "Last name is required";
    if (!this.isEmail(form.email)) errors.email = "Enter a valid email";
    if (!this.minLength(form.password, 6)) errors.password = "Password must be at least 6 characters";
    if (!this.matches(form.password, form.confirmPassword))
      errors.confirmPassword = "Passwords do not match";
    return this.result(errors);
  }
}
