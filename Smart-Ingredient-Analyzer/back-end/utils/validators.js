// utils/validators.js - Input Validation
import { IMAGE_LIMITS } from "../configuration/constants.js";

export class Validators {
  static validateRequestBody(req) {
    if (!req.body) {
      return {
        valid: false,
        error: "No request body",
        code: "NO_REQUEST_BODY",
      };
    }
    return { valid: true };
  }

  static validateImage(image) {
    if (!image) {
      return {
        valid: false,
        error: "Image is missing",
        code: "MISSING_IMAGE",
      };
    }

    if (typeof image !== "string") {
      return {
        valid: false,
        error: "Image must be a base64 string",
        code: "INVALID_IMAGE_FORMAT",
      };
    }

    return { valid: true };
  }

  static validateBase64(base64Data) {
    if (!base64Data) {
      return {
        valid: false,
        error: "No base64 data found in image",
        code: "INVALID_IMAGE_DATA",
      };
    }

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      return {
        valid: false,
        error: "Invalid base64 format",
        code: "INVALID_IMAGE_DATA",
      };
    }

    return { valid: true };
  }

  static validateImageBuffer(buffer) {
    if (!buffer || buffer.length === 0) {
      return {
        valid: false,
        error: "Empty image buffer",
        code: "INVALID_IMAGE_DATA",
      };
    }

    if (buffer.length > IMAGE_LIMITS.maxSizeBytes) {
      return {
        valid: false,
        error: "Image file too large",
        code: "IMAGE_TOO_LARGE",
        maxSize: "10MB",
      };
    }

    if (buffer.length < IMAGE_LIMITS.minSizeBytes) {
      return {
        valid: false,
        error: "Image file too small",
        code: "IMAGE_TOO_SMALL",
        minSize: "1KB",
      };
    }

    return { valid: true };
  }

  static validateIngredients(ingredients) {
    if (!ingredients || ingredients.trim().length < 5) {
      return {
        valid: false,
        error:
          "No ingredient list found in image. Please focus on the ingredients section of the food label.",
        code: "INSUFFICIENT_INGREDIENTS",
      };
    }

    return { valid: true };
  }
}

export default Validators;
