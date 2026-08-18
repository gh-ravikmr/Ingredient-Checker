// middleware/errorHandler.js - Error Handling Middleware
export class ErrorHandler {
  static handle(error, req, res) {
    // Anything can be thrown, so never assume `error.message` is a string.
    const message = String(error?.message || error || "");
    console.error("❌ Error:", message);

    let statusCode = 500;
    let errorResponse = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };

    if (message.includes("timeout")) {
      statusCode = 504;
      errorResponse = {
        error: "Analysis timed out. Please try with a clearer image.",
        code: "TIMEOUT_ERROR",
      };
    } else if (message.includes("Invalid ingredient image")) {
      statusCode = 400;
      errorResponse = {
        error: "Please upload a clear image of food ingredient labels",
        code: "INVALID_IMAGE",
      };
    } else if (message.includes("quota exceeded")) {
      statusCode = 429;
      errorResponse = {
        error: "API quota exceeded. Please try again later.",
        code: "QUOTA_EXCEEDED",
      };
    } else if (message.includes("rate limit")) {
      statusCode = 429;
      errorResponse = {
        error: "Too many requests. Please wait a moment.",
        code: "RATE_LIMITED",
      };
    } else if (message.includes("network") || message.includes("fetch")) {
      statusCode = 503;
      errorResponse = {
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    } else if (error?.code) {
      statusCode = error.statusCode || 400;
      errorResponse = {
        error: error.error || message,
        code: error.code,
      };
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = message;
    }

    if (req?.startTime) {
      errorResponse.processingTime = Date.now() - req.startTime;
    }

    return res.status(statusCode).json(errorResponse);
  }

  static setupGlobalHandler(app) {
    // eslint-disable-next-line no-unused-vars
    app.use((error, req, res, next) => {
      ErrorHandler.handle(error, req, res);
    });
  }
}

export default ErrorHandler;
