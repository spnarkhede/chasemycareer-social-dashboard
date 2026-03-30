// lib/api-error.ts
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message: string = "Forbidden") {
    return new ApiError(message, 403, "FORBIDDEN");
  }

  static notFound(message: string = "Resource not found") {
    return new ApiError(message, 404, "NOT_FOUND");
  }

  static tooManyRequests(message: string = "Too many requests") {
    return new ApiError(message, 429, "RATE_LIMIT_EXCEEDED");
  }

  static externalApi(message: string, details?: any) {
    return new ApiError(message, 502, "EXTERNAL_API_ERROR", details);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
    };
  }

  console.error("Unhandled API error:", error);

  return {
    status: 500,
    body: {
      error: {
        message: process.env.NODE_ENV === "production" 
          ? "Internal server error" 
          : (error as Error).message,
        code: "INTERNAL_ERROR",
      },
    },
  };
}