import { BaseValidator } from "./BaseValidator";

// Accepts only images, <= 2 MB. Normalized to the same {errors, isValid} shape as every other
// validator (the original validateImage() returned a bare string instead).
export class ImageValidator extends BaseValidator {
  static validate(file) {
    const errors = {};
    if (!file) errors.image = "Please select an image";
    else if (!file.type.startsWith("image/")) errors.image = "File must be an image";
    else if (file.size > 2 * 1024 * 1024) errors.image = "Image must be smaller than 2 MB";
    return this.result(errors);
  }
}
