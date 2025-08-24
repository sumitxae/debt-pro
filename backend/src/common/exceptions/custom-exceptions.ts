import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES, ErrorCode } from './error-codes';

export class AuthenticationException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.UNAUTHORIZED, error.code, details, requestId);
  }
}

export class ValidationException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.BAD_REQUEST, error.code, details, requestId);
  }
}

export class NotFoundException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.NOT_FOUND, error.code, details, requestId);
  }
}

export class ForbiddenException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.FORBIDDEN, error.code, details, requestId);
  }
}

export class ConflictException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.CONFLICT, error.code, details, requestId);
  }
}

export class DatabaseException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.INTERNAL_SERVER_ERROR, error.code, details, requestId);
  }
}

export class ExternalServiceException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.SERVICE_UNAVAILABLE, error.code, details, requestId);
  }
}

export class RateLimitException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.TOO_MANY_REQUESTS, error.code, details, requestId);
  }
}

export class InternalServerException extends BaseException {
  constructor(errorCode: ErrorCode, details?: any, requestId?: string) {
    const error = ERROR_CODES[errorCode];
    super(error.userMessage, HttpStatus.INTERNAL_SERVER_ERROR, error.code, details, requestId);
  }
}

// Convenience factory functions
export const createAuthException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new AuthenticationException(errorCode, details, requestId);

export const createValidationException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new ValidationException(errorCode, details, requestId);

export const createNotFoundException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new NotFoundException(errorCode, details, requestId);

export const createForbiddenException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new ForbiddenException(errorCode, details, requestId);

export const createConflictException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new ConflictException(errorCode, details, requestId);

export const createDatabaseException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new DatabaseException(errorCode, details, requestId);

export const createExternalServiceException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new ExternalServiceException(errorCode, details, requestId);

export const createRateLimitException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new RateLimitException(errorCode, details, requestId);

export const createInternalServerException = (errorCode: ErrorCode, details?: any, requestId?: string) =>
  new InternalServerException(errorCode, details, requestId); 