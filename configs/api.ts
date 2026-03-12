// Success response wrapper
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    timestamp: number;
    requestId: string;
  };
}

// Paginated response wrapper
export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    timestamp: number;
    requestId: string;
  };
}

// Error response
export interface ApiErrorResponse {
  error: {
    code: number;
    message: string;
    details?: unknown;
    timestamp: number;
    requestId: string;
  };
}

 

export const ErrorCode = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOKEN_EXPIRED: 401,
  TOKEN_INVALID: 401,

  BAD_REQUEST: 400,
  METHOD_NOT_ALLOWED: 405,
  UNSUPPORTED_MEDIA_TYPE: 415,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,

  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  UNPROCESSABLE_ENTITY: 422,

  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,

  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,

  UPSTREAM_ERROR: 502,

  PROCESSING_FAILED: 500,
  EXTRACTION_FAILED: 500,
  INSUFFICIENT_FUNDS: 400,
  LIMIT_EXCEEDED: 429,
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export function apiSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    data,
    meta: {
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
    },
  };
}

export function apiErrorResponse(
  code: ErrorCodeType,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      details,
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
    },
  };
}

export default class ApiError extends Error {
  code: number;
  details?: string;
  timestamp: number;
  requestId: string;

  constructor(apiErrorResponse: ApiErrorResponse) {
    super(apiErrorResponse.error.message);
    this.name = "ApiError";
    this.code = apiErrorResponse.error.code;
    this.details =
      typeof apiErrorResponse.error.details === "string"
        ? apiErrorResponse.error.details
        : String(apiErrorResponse.error.details);
    this.timestamp = apiErrorResponse.error.timestamp;
    this.requestId = apiErrorResponse.error.requestId;
  }
}
