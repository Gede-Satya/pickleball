export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export function successResponse(
  message: string,
  data: any = {},
  status: number = 200,
  pagination?: PaginationMeta
) {
  const response: any = {
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
