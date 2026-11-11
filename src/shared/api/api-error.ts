export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code = 'HTTP_ERROR') {
    super('API request failed.');
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
