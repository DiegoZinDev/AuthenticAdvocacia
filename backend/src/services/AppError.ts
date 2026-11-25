export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: string[];

  constructor(statusCode: number, message: string, details?: string[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
