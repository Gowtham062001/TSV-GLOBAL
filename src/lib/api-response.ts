import { NextResponse } from "next/server";

export interface ApiResponseOptions<T> {
  success?: boolean;
  data?: T | null;
  error?: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  status?: number;
}

export function apiResponse<T>({
  success = true,
  data = null,
  error = null,
  meta,
  status = 200,
}: ApiResponseOptions<T>) {
  return NextResponse.json(
    {
      success,
      data,
      error,
      ...(meta && { meta }),
    },
    { status }
  );
}

export function apiError(message: string, status: number = 400) {
  return apiResponse({
    success: false,
    error: message,
    status,
  });
}
