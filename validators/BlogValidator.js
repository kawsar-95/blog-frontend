import { BaseValidator } from "./BaseValidator";

export class BlogValidator extends BaseValidator {
  static validate(form) {
    const errors = {};
    if (!this.isNonEmpty(form.blogTitle) || String(form.blogTitle).trim().length < 3)
      errors.blogTitle = "Title must be at least 3 characters";
    if (!this.isNonEmpty(form.category)) errors.category = "Category is required";
    if (!this.isNonEmpty(form.blog) || String(form.blog).trim().length < 10)
      errors.blog = "Blog content must be at least 10 characters";
    return this.result(errors);
  }
}
