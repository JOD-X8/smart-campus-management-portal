import { NextResponse } from "next/server";

export interface ApiResponseOptions<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export function apiSuccess<T>(data: T, message = "Operation successful", status = 200, meta?: ApiResponseOptions<T>["meta"]) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      meta,
    },
    { status }
  );
}

export function apiError(error: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status }
  );
}

export function apiUnauthorized(message = "Unauthorized access") {
  return apiError(message, 401);
}

export function apiForbidden(message = "Forbidden: Insufficient permissions") {
  return apiError(message, 403);
}

export function apiNotFound(message = "Resource not found") {
  return apiError(message, 404);
}

export function apiInternalError(message = "Internal server error") {
  return apiError(message, 500);
}
