export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export function successResponse<T = unknown>(
  message: string,
  data: T = {} as T,
  status: number = 200,
  pagination?: PaginationMeta
) {
  const response: Record<string, unknown> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "v1",
    },
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return Response.json(response, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code: string = "BAD_REQUEST",
  details: string = ""
) {
  return Response.json(
    {
      success: false,
      message,
      error: {
        code,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "v1",
      },
    },
    { status }
  );
}
