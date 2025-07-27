export const ERROR_CODES = {
  // Authentication Errors (1000-1099)
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: 'Invalid email or password',
    userMessage: 'The email or password you entered is incorrect. Please try again.',
  },
  AUTH_USER_NOT_FOUND: {
    code: 'AUTH_002',
    message: 'User not found',
    userMessage: 'No account found with this email address.',
  },
  AUTH_USER_ALREADY_EXISTS: {
    code: 'AUTH_003',
    message: 'User already exists',
    userMessage: 'An account with this email already exists. Please use a different email or try logging in.',
  },
  AUTH_INVALID_TOKEN: {
    code: 'AUTH_004',
    message: 'Invalid or expired token',
    userMessage: 'Your session has expired. Please log in again.',
  },
  AUTH_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTH_005',
    message: 'Insufficient permissions',
    userMessage: 'You do not have permission to perform this action.',
  },
  AUTH_ACCOUNT_LOCKED: {
    code: 'AUTH_006',
    message: 'Account is locked',
    userMessage: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
  },

  // Validation Errors (2000-2099)
  VALIDATION_FAILED: {
    code: 'VAL_001',
    message: 'Validation failed',
    userMessage: 'Please check your input and try again.',
  },
  VALIDATION_REQUIRED_FIELD: {
    code: 'VAL_002',
    message: 'Required field missing',
    userMessage: 'This field is required.',
  },
  VALIDATION_INVALID_FORMAT: {
    code: 'VAL_003',
    message: 'Invalid format',
    userMessage: 'The format is not valid.',
  },
  VALIDATION_INVALID_EMAIL: {
    code: 'VAL_004',
    message: 'Invalid email format',
    userMessage: 'Please enter a valid email address.',
  },
  VALIDATION_PASSWORD_TOO_WEAK: {
    code: 'VAL_005',
    message: 'Password too weak',
    userMessage: 'Password must be at least 8 characters long and contain uppercase, lowercase, and number.',
  },
  VALIDATION_INVALID_DATE: {
    code: 'VAL_006',
    message: 'Invalid date format',
    userMessage: 'Please enter a valid date.',
  },
  VALIDATION_INVALID_AMOUNT: {
    code: 'VAL_007',
    message: 'Invalid amount',
    userMessage: 'Please enter a valid amount greater than 0.',
  },
  VALIDATION_INVALID_PERCENTAGE: {
    code: 'VAL_008',
    message: 'Invalid percentage',
    userMessage: 'Percentage must be between 0 and 100.',
  },

  // Debt Errors (3000-3099)
  DEBT_NOT_FOUND: {
    code: 'DEBT_001',
    message: 'Debt not found',
    userMessage: 'The debt you are looking for does not exist.',
  },
  DEBT_ACCESS_DENIED: {
    code: 'DEBT_002',
    message: 'Access denied to debt',
    userMessage: 'You do not have permission to access this debt.',
  },
  DEBT_INVALID_AMOUNT: {
    code: 'DEBT_003',
    message: 'Invalid debt amount',
    userMessage: 'Debt amount must be greater than 0.',
  },
  DEBT_INVALID_INTEREST_RATE: {
    code: 'DEBT_004',
    message: 'Invalid interest rate',
    userMessage: 'Interest rate must be between 0 and 100 percent.',
  },
  DEBT_PAYMENT_EXCEEDS_BALANCE: {
    code: 'DEBT_005',
    message: 'Payment exceeds debt balance',
    userMessage: 'Payment amount cannot exceed the current debt balance.',
  },

  // Payment Errors (4000-4099)
  PAYMENT_NOT_FOUND: {
    code: 'PAY_001',
    message: 'Payment not found',
    userMessage: 'The payment you are looking for does not exist.',
  },
  PAYMENT_ACCESS_DENIED: {
    code: 'PAY_002',
    message: 'Access denied to payment',
    userMessage: 'You do not have permission to access this payment.',
  },
  PAYMENT_INVALID_AMOUNT: {
    code: 'PAY_003',
    message: 'Invalid payment amount',
    userMessage: 'Payment amount must be greater than 0.',
  },
  PAYMENT_DATE_IN_FUTURE: {
    code: 'PAY_004',
    message: 'Payment date cannot be in the future',
    userMessage: 'Payment date cannot be set in the future.',
  },

  // Budget Errors (5000-5099)
  BUDGET_NOT_FOUND: {
    code: 'BUDGET_001',
    message: 'Budget not found',
    userMessage: 'The budget you are looking for does not exist.',
  },
  BUDGET_ACCESS_DENIED: {
    code: 'BUDGET_002',
    message: 'Access denied to budget',
    userMessage: 'You do not have permission to access this budget.',
  },
  BUDGET_INVALID_AMOUNT: {
    code: 'BUDGET_003',
    message: 'Invalid budget amount',
    userMessage: 'Budget amount must be greater than 0.',
  },
  BUDGET_CATEGORY_NOT_FOUND: {
    code: 'BUDGET_004',
    message: 'Budget category not found',
    userMessage: 'The budget category you are looking for does not exist.',
  },

  // User Errors (6000-6099)
  USER_NOT_FOUND: {
    code: 'USER_001',
    message: 'User not found',
    userMessage: 'The user you are looking for does not exist.',
  },
  USER_ACCESS_DENIED: {
    code: 'USER_002',
    message: 'Access denied to user',
    userMessage: 'You do not have permission to access this user.',
  },
  USER_INVALID_INCOME: {
    code: 'USER_003',
    message: 'Invalid monthly income',
    userMessage: 'Monthly income must be greater than 0.',
  },

  // Database Errors (7000-7099)
  DB_CONNECTION_ERROR: {
    code: 'DB_001',
    message: 'Database connection error',
    userMessage: 'We are experiencing technical difficulties. Please try again later.',
  },
  DB_QUERY_FAILED: {
    code: 'DB_002',
    message: 'Database query failed',
    userMessage: 'We are experiencing technical difficulties. Please try again later.',
  },
  DB_DUPLICATE_ENTRY: {
    code: 'DB_003',
    message: 'Duplicate entry',
    userMessage: 'This record already exists.',
  },
  DB_FOREIGN_KEY_VIOLATION: {
    code: 'DB_004',
    message: 'Foreign key violation',
    userMessage: 'Cannot delete this record as it is referenced by other records.',
  },
  DB_CONSTRAINT_VIOLATION: {
    code: 'DB_005',
    message: 'Database constraint violation',
    userMessage: 'The data provided violates database constraints.',
  },

  // External Service Errors (8000-8099)
  EXTERNAL_SERVICE_UNAVAILABLE: {
    code: 'EXT_001',
    message: 'External service unavailable',
    userMessage: 'We are experiencing issues with external services. Please try again later.',
  },
  EXTERNAL_SERVICE_TIMEOUT: {
    code: 'EXT_002',
    message: 'External service timeout',
    userMessage: 'The request took too long to process. Please try again.',
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXT_003',
    message: 'External service error',
    userMessage: 'We encountered an error with an external service. Please try again later.',
  },

  // Rate Limiting Errors (9000-9099)
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_001',
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please wait a moment before trying again.',
  },

  // Generic Errors (9999)
  INTERNAL_SERVER_ERROR: {
    code: 'GEN_001',
    message: 'Internal server error',
    userMessage: 'Something went wrong on our end. Please try again later.',
  },
  NOT_FOUND: {
    code: 'GEN_002',
    message: 'Resource not found',
    userMessage: 'The resource you are looking for does not exist.',
  },
  METHOD_NOT_ALLOWED: {
    code: 'GEN_003',
    message: 'Method not allowed',
    userMessage: 'This operation is not allowed.',
  },
  REQUEST_TIMEOUT: {
    code: 'GEN_004',
    message: 'Request timeout',
    userMessage: 'The request took too long to process. Please try again.',
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES; 