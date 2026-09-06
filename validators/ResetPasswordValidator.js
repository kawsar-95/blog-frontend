import { BaseValidator } from "./BaseValidator";

export class ResetPasswordValidator extends BaseValidator {
  static validate(form) {
    const errors = {};
    if (!this.minLength(form.password, 6)) errors.password = "Password must be at least 6 characters";
    if (!this.matches(form.password, form.confirmPassword))
      errors.confirmPassword = "Passwords do not match";
    return this.result(errors);
  }
}
