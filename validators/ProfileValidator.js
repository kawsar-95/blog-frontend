import { BaseValidator } from "./BaseValidator";

export class ProfileValidator extends BaseValidator {
  static validate(form) {
    const errors = {};
    if (!this.isNonEmpty(form.firstName)) errors.firstName = "First name is required";
    if (!this.isNonEmpty(form.lastName)) errors.lastName = "Last name is required";
    return this.result(errors);
  }
}
