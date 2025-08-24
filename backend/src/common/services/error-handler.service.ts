import { Injectable } from '@nestjs/common';
import {
  createAuthException,
  createValidationException,
  createNotFoundException,
  createForbiddenException,
  createConflictException,
  createDatabaseException,
  createExternalServiceException,
  createRateLimitException,
  createInternalServerException,
  ErrorCode,
} from '../exceptions';

@Injectable()
export class ErrorHandlerService {
  // Authentication errors
  throwInvalidCredentials(details?: any, requestId?: string): never {
    throw createAuthException('AUTH_INVALID_CREDENTIALS', details, requestId);
  }

  throwUserNotFoundAuth(details?: any, requestId?: string): never {
    throw createAuthException('AUTH_USER_NOT_FOUND', details, requestId);
  }

  throwUserAlreadyExists(details?: any, requestId?: string): never {
    throw createAuthException('AUTH_USER_ALREADY_EXISTS', details, requestId);
  }

  throwInvalidToken(details?: any, requestId?: string): never {
    throw createAuthException('AUTH_INVALID_TOKEN', details, requestId);
  }

  throwInsufficientPermissions(details?: any, requestId?: string): never {
    throw createAuthException('AUTH_INSUFFICIENT_PERMISSIONS', details, requestId);
  }

  throwAccountLocked(details?: any, requestId?: string): never {
    throw createAuthException('AUTH_ACCOUNT_LOCKED', details, requestId);
  }

  // Validation errors
  throwValidationError(details?: any, requestId?: string): never {
    throw createValidationException('VALIDATION_FAILED', details, requestId);
  }

  throwRequiredField(field: string, requestId?: string): never {
    throw createValidationException('VALIDATION_REQUIRED_FIELD', { field }, requestId);
  }

  throwInvalidFormat(field: string, format: string, requestId?: string): never {
    throw createValidationException('VALIDATION_INVALID_FORMAT', { field, format }, requestId);
  }

  throwInvalidEmail(requestId?: string): never {
    throw createValidationException('VALIDATION_INVALID_EMAIL', null, requestId);
  }

  throwPasswordTooWeak(requestId?: string): never {
    throw createValidationException('VALIDATION_PASSWORD_TOO_WEAK', null, requestId);
  }

  throwInvalidAmount(field: string, requestId?: string): never {
    throw createValidationException('VALIDATION_INVALID_AMOUNT', { field }, requestId);
  }

  throwInvalidPercentage(field: string, requestId?: string): never {
    throw createValidationException('VALIDATION_INVALID_PERCENTAGE', { field }, requestId);
  }

  // Debt errors
  throwDebtNotFound(debtId: string, requestId?: string): never {
    throw createNotFoundException('DEBT_NOT_FOUND', { debtId }, requestId);
  }

  throwDebtAccessDenied(debtId: string, requestId?: string): never {
    throw createForbiddenException('DEBT_ACCESS_DENIED', { debtId }, requestId);
  }

  throwInvalidDebtAmount(amount: number, requestId?: string): never {
    throw createValidationException('DEBT_INVALID_AMOUNT', { amount }, requestId);
  }

  throwInvalidInterestRate(rate: number, requestId?: string): never {
    throw createValidationException('DEBT_INVALID_INTEREST_RATE', { rate }, requestId);
  }

  throwPaymentExceedsBalance(paymentAmount: number, currentBalance: number, requestId?: string): never {
    throw createValidationException('DEBT_PAYMENT_EXCEEDS_BALANCE', { paymentAmount, currentBalance }, requestId);
  }

  // Payment errors
  throwPaymentNotFound(paymentId: string, requestId?: string): never {
    throw createNotFoundException('PAYMENT_NOT_FOUND', { paymentId }, requestId);
  }

  throwPaymentAccessDenied(paymentId: string, requestId?: string): never {
    throw createForbiddenException('PAYMENT_ACCESS_DENIED', { paymentId }, requestId);
  }

  throwInvalidPaymentAmount(amount: number, requestId?: string): never {
    throw createValidationException('PAYMENT_INVALID_AMOUNT', { amount }, requestId);
  }

  throwPaymentDateInFuture(date: string, requestId?: string): never {
    throw createValidationException('PAYMENT_DATE_IN_FUTURE', { date }, requestId);
  }

  // Budget errors
  throwBudgetNotFound(budgetId: string, requestId?: string): never {
    throw createNotFoundException('BUDGET_NOT_FOUND', { budgetId }, requestId);
  }

  throwBudgetAccessDenied(budgetId: string, requestId?: string): never {
    throw createForbiddenException('BUDGET_ACCESS_DENIED', { budgetId }, requestId);
  }

  throwInvalidBudgetAmount(amount: number, requestId?: string): never {
    throw createValidationException('BUDGET_INVALID_AMOUNT', { amount }, requestId);
  }

  throwBudgetCategoryNotFound(category: string, requestId?: string): never {
    throw createNotFoundException('BUDGET_CATEGORY_NOT_FOUND', { category }, requestId);
  }

  // User errors
  throwUserNotFound(userId: string, requestId?: string): never {
    throw createNotFoundException('USER_NOT_FOUND', { userId }, requestId);
  }

  throwUserAccessDenied(userId: string, requestId?: string): never {
    throw createForbiddenException('USER_ACCESS_DENIED', { userId }, requestId);
  }

  throwInvalidMonthlyIncome(income: number, requestId?: string): never {
    throw createValidationException('USER_INVALID_INCOME', { income }, requestId);
  }

  // Database errors
  throwDatabaseConnectionError(details?: any, requestId?: string): never {
    throw createDatabaseException('DB_CONNECTION_ERROR', details, requestId);
  }

  throwDatabaseQueryFailed(details?: any, requestId?: string): never {
    throw createDatabaseException('DB_QUERY_FAILED', details, requestId);
  }

  throwDuplicateEntry(field: string, value: any, requestId?: string): never {
    throw createConflictException('DB_DUPLICATE_ENTRY', { field, value }, requestId);
  }

  throwForeignKeyViolation(details?: any, requestId?: string): never {
    throw createDatabaseException('DB_FOREIGN_KEY_VIOLATION', details, requestId);
  }

  throwConstraintViolation(details?: any, requestId?: string): never {
    throw createDatabaseException('DB_CONSTRAINT_VIOLATION', details, requestId);
  }

  // External service errors
  throwExternalServiceUnavailable(service: string, requestId?: string): never {
    throw createExternalServiceException('EXTERNAL_SERVICE_UNAVAILABLE', { service }, requestId);
  }

  throwExternalServiceTimeout(service: string, timeout: number, requestId?: string): never {
    throw createExternalServiceException('EXTERNAL_SERVICE_TIMEOUT', { service, timeout }, requestId);
  }

  throwExternalServiceError(service: string, details?: any, requestId?: string): never {
    throw createExternalServiceException('EXTERNAL_SERVICE_ERROR', { service, details }, requestId);
  }

  // Rate limiting errors
  throwRateLimitExceeded(limit: number, window: string, requestId?: string): never {
    throw createRateLimitException('RATE_LIMIT_EXCEEDED', { limit, window }, requestId);
  }

  // Generic errors
  throwInternalServerError(details?: any, requestId?: string): never {
    throw createInternalServerException('INTERNAL_SERVER_ERROR', details, requestId);
  }

  throwNotFound(resource: string, id?: string, requestId?: string): never {
    throw createNotFoundException('NOT_FOUND', { resource, id }, requestId);
  }

  throwMethodNotAllowed(method: string, requestId?: string): never {
    throw createForbiddenException('METHOD_NOT_ALLOWED', { method }, requestId);
  }

  throwRequestTimeout(timeout: number, requestId?: string): never {
    throw createInternalServerException('REQUEST_TIMEOUT', { timeout }, requestId);
  }

  // Generic method for custom errors
  throwCustomError(errorCode: ErrorCode, details?: any, requestId?: string): never {
    switch (errorCode) {
      case 'AUTH_INVALID_CREDENTIALS':
      case 'AUTH_USER_NOT_FOUND':
      case 'AUTH_USER_ALREADY_EXISTS':
      case 'AUTH_INVALID_TOKEN':
      case 'AUTH_INSUFFICIENT_PERMISSIONS':
      case 'AUTH_ACCOUNT_LOCKED':
        throw createAuthException(errorCode, details, requestId);
      
      case 'VALIDATION_FAILED':
      case 'VALIDATION_REQUIRED_FIELD':
      case 'VALIDATION_INVALID_FORMAT':
      case 'VALIDATION_INVALID_EMAIL':
      case 'VALIDATION_PASSWORD_TOO_WEAK':
      case 'VALIDATION_INVALID_DATE':
      case 'VALIDATION_INVALID_AMOUNT':
      case 'VALIDATION_INVALID_PERCENTAGE':
        throw createValidationException(errorCode, details, requestId);
      
      case 'DEBT_NOT_FOUND':
      case 'PAYMENT_NOT_FOUND':
      case 'BUDGET_NOT_FOUND':
      case 'BUDGET_CATEGORY_NOT_FOUND':
      case 'USER_NOT_FOUND':
      case 'NOT_FOUND':
        throw createNotFoundException(errorCode, details, requestId);
      
      case 'DEBT_ACCESS_DENIED':
      case 'PAYMENT_ACCESS_DENIED':
      case 'BUDGET_ACCESS_DENIED':
      case 'USER_ACCESS_DENIED':
      case 'AUTH_INSUFFICIENT_PERMISSIONS':
      case 'METHOD_NOT_ALLOWED':
        throw createForbiddenException(errorCode, details, requestId);
      
      case 'DB_DUPLICATE_ENTRY':
      case 'AUTH_USER_ALREADY_EXISTS':
        throw createConflictException(errorCode, details, requestId);
      
      case 'DB_CONNECTION_ERROR':
      case 'DB_QUERY_FAILED':
      case 'DB_FOREIGN_KEY_VIOLATION':
      case 'DB_CONSTRAINT_VIOLATION':
        throw createDatabaseException(errorCode, details, requestId);
      
      case 'EXTERNAL_SERVICE_UNAVAILABLE':
      case 'EXTERNAL_SERVICE_TIMEOUT':
      case 'EXTERNAL_SERVICE_ERROR':
        throw createExternalServiceException(errorCode, details, requestId);
      
      case 'RATE_LIMIT_EXCEEDED':
        throw createRateLimitException(errorCode, details, requestId);
      
      default:
        throw createInternalServerException('INTERNAL_SERVER_ERROR', details, requestId);
    }
  }
} 