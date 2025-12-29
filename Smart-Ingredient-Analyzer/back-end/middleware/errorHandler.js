// middleware/errorHandler.js - Error Handling Middleware
export class ErrorHandler {
  static handle(error, req, res) {
    console.error("❌ Error:", error.message);

    let statusCode = 500;
    let errorResponse = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };

    if (error.message.includes("timeout")) {
      statusCode = 504;
      errorResponse = {
        error: "Analysis timed out. Please try with a clearer image.",
        code: "TIMEOUT_ERROR",
      };
    } else if (error.message.includes("Invalid ingredient image")) {
      statusCode = 400;
      errorResponse = {
        error: "Please upload a clear image of food ingredient labels",
        code: "INVALID_IMAGE",
      };
    } else if (error.message.includes("quota exceeded")) {
      statusCode = 429;
      errorResponse = {
        error: "API quota exceeded. Please try again later.",
        code: "QUOTA_EXCEEDED",
      };
    } else if (error.message.includes("rate limit")) {
      statusCode = 429;
      errorResponse = {
        error: "Too many requests. Please wait a moment.",
        code: "RATE_LIMITED",
      };
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      statusCode = 503;
      errorResponse = {
        error: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    } else if (error.code) {
      statusCode = error.statusCode || 400;
      errorResponse = {
        error: error.error || error.message,
        code: error.code,
      };
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = error.message;
    }

    errorResponse.processingTime = Date.now() - req.startTime;

    return res.status(statusCode).json(errorResponse);
  }

  static setupGlobalHandler(app) {
    app.use((error, req, res, next) => {
      this.handle(error, req, res);
    });
  }
}

export default ErrorHandler;
