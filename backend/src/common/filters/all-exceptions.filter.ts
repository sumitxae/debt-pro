import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';
import { ValidationError } from 'class-validator';
import { BaseException, ErrorResponse, ERROR_CODES } from '../exceptions';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = uuidv4();

    // Add request ID to request object for logging
    (request as any).requestId = requestId;

    let errorResponse: ErrorResponse;

    if (exception instanceof BaseException) {
      // Handle our custom exceptions
      errorResponse = this.handleCustomException(exception, request, requestId);
    } else if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      errorResponse = this.handleHttpException(exception, request, requestId);
    } else if (exception instanceof QueryFailedError) {
      // Handle TypeORM query errors
      errorResponse = this.handleDatabaseError(exception, request, requestId);
    } else if (exception instanceof EntityNotFoundError) {
      // Handle TypeORM entity not found errors
      errorResponse = this.handleEntityNotFoundError(exception, request, requestId);
    } else if (exception instanceof TypeORMError) {
      // Handle other TypeORM errors
      errorResponse = this.handleTypeORMError(exception, request, requestId);
    } else if (exception instanceof ValidationError) {
      // Handle validation errors
      errorResponse = this.handleValidationError(exception, request, requestId);
    } else {
      // Handle unknown errors
      errorResponse = this.handleUnknownError(exception, request, requestId);
    }

    // Log the error with appropriate level
    this.logError(exception, request, errorResponse);

    // Send the error response
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleCustomException(
    exception: BaseException,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    const response = exception.getResponse() as ErrorResponse;
    response.path = request.url;
    response.requestId = requestId;
    return response;
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();
    
    let message: string;
    let details: any = null;

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (typeof errorResponse === 'object') {
      const errorObj = errorResponse as any;
      message = errorObj.message || errorObj.error || 'An error occurred';
      details = errorObj.details || null;
    } else {
      message = 'An error occurred';
    }

    // Map common HTTP status codes to our error codes
    let errorCode: string;
    let userMessage: string;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        errorCode = ERROR_CODES.VALIDATION_FAILED.code;
        userMessage = ERROR_CODES.VALIDATION_FAILED.userMessage;
        break;
      case HttpStatus.UNAUTHORIZED:
        errorCode = ERROR_CODES.AUTH_INVALID_TOKEN.code;
        userMessage = ERROR_CODES.AUTH_INVALID_TOKEN.userMessage;
        break;
      case HttpStatus.FORBIDDEN:
        errorCode = ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS.code;
        userMessage = ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS.userMessage;
        break;
      case HttpStatus.NOT_FOUND:
        errorCode = ERROR_CODES.NOT_FOUND.code;
        userMessage = ERROR_CODES.NOT_FOUND.userMessage;
        break;
      case HttpStatus.CONFLICT:
        errorCode = ERROR_CODES.DB_DUPLICATE_ENTRY.code;
        userMessage = ERROR_CODES.DB_DUPLICATE_ENTRY.userMessage;
        break;
      case HttpStatus.TOO_MANY_REQUESTS:
        errorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED.code;
        userMessage = ERROR_CODES.RATE_LIMIT_EXCEEDED.userMessage;
        break;
      case HttpStatus.REQUEST_TIMEOUT:
        errorCode = ERROR_CODES.REQUEST_TIMEOUT.code;
        userMessage = ERROR_CODES.REQUEST_TIMEOUT.userMessage;
        break;
      default:
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR.code;
        userMessage = ERROR_CODES.INTERNAL_SERVER_ERROR.userMessage;
    }

    return {
      success: false,
      statusCode: status,
      errorCode,
      message: userMessage,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };
  }

  private handleDatabaseError(
    exception: QueryFailedError,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    let errorCode: string;
    let userMessage: string;
    let details = null;

    // Handle specific database errors
    if (exception.message.includes('duplicate key') || exception.message.includes('UNIQUE')) {
      errorCode = ERROR_CODES.DB_DUPLICATE_ENTRY.code;
      userMessage = ERROR_CODES.DB_DUPLICATE_ENTRY.userMessage;
    } else if (exception.message.includes('foreign key') || exception.message.includes('FOREIGN KEY')) {
      errorCode = ERROR_CODES.DB_FOREIGN_KEY_VIOLATION.code;
      userMessage = ERROR_CODES.DB_FOREIGN_KEY_VIOLATION.userMessage;
    } else if (exception.message.includes('constraint') || exception.message.includes('CHECK')) {
      errorCode = ERROR_CODES.DB_CONSTRAINT_VIOLATION.code;
      userMessage = ERROR_CODES.DB_CONSTRAINT_VIOLATION.userMessage;
    } else {
      errorCode = ERROR_CODES.DB_QUERY_FAILED.code;
      userMessage = ERROR_CODES.DB_QUERY_FAILED.userMessage;
    }

    return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode,
      message: userMessage,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };
  }

  private handleEntityNotFoundError(
    exception: EntityNotFoundError,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    return {
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: ERROR_CODES.NOT_FOUND.code,
      message: ERROR_CODES.NOT_FOUND.userMessage,
      details: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };
  }

  private handleTypeORMError(
    exception: TypeORMError,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ERROR_CODES.DB_CONNECTION_ERROR.code,
      message: ERROR_CODES.DB_CONNECTION_ERROR.userMessage,
      details: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };
  }

  private handleValidationError(
    exception: ValidationError,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    const details = this.formatValidationErrors(exception);
    
    return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ERROR_CODES.VALIDATION_FAILED.code,
      message: ERROR_CODES.VALIDATION_FAILED.userMessage,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };
  }

  private handleUnknownError(
    exception: unknown,
    request: Request,
    requestId: string,
  ): ErrorResponse {
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
      message: ERROR_CODES.INTERNAL_SERVER_ERROR.userMessage,
      details: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };
  }

  private formatValidationErrors(error: ValidationError): any {
    const result: any = {};

    if (error.constraints) {
      result[error.property] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      error.children.forEach(child => {
        const childResult = this.formatValidationErrors(child);
        Object.assign(result, childResult);
      });
    }

    return result;
  }

  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const logData = {
      requestId: errorResponse.requestId,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      message: errorResponse.message,
      details: errorResponse.details,
      timestamp: errorResponse.timestamp,
    };

    // Log with appropriate level based on error type
    if (errorResponse.statusCode >= 500) {
      this.logger.error('Server Error', {
        ...logData,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn('Client Error', logData);
    } else {
      this.logger.log('Info', logData);
    }
  }
}