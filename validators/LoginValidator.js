import { BaseValidator } from "./BaseValidator";

export class LoginValidator extends BaseValidator {
  static validate(form) {
    const errors = {};
    if (!this.isEmail(form.email)) errors.email = "Enter a valid email";
    if (!this.isNonEmpty(form.password)) errors.password = "Password is required";
    return this.result(errors);
  }
}
