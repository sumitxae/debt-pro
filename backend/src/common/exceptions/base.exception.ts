import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  requestId?: string;
}

export abstract class BaseException extends HttpException {
  public readonly errorCode: string;
  public readonly details?: any;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    details?: any,
    requestId?: string,
  ) {
    super(message, statusCode);
    this.errorCode = errorCode;
    this.details = details;
    this.requestId = requestId;
  }

  getResponse(): ErrorResponse {
    return {
      success: false,
      statusCode: this.getStatus(),
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
      path: this.getPath(),
      requestId: this.requestId,
    };
  }

  private getPath(): string {
    // This will be set by the exception filter
    return '';
  }
} 