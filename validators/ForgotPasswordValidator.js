import { BaseValidator } from "./BaseValidator";

export class ForgotPasswordValidator extends BaseValidator {
  static validate(form) {
    const errors = {};
    if (!this.isEmail(form.email)) errors.email = "Enter a valid email";
    return this.result(errors);
  }
}
