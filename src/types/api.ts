export class ApiError extends Error {
  readonly status: number;
  readonly requestId?: string;
  readonly code?: string;

  constructor(
    message: string,
    options: { status: number; requestId?: string; code?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.requestId = options.requestId;
    this.code = options.code;
  }
}

export interface ApiResponseEnvelope<T> {
  data: T;
  requestId?: string;
}
