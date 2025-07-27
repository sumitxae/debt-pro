import { Injectable, Controller, Get, Param, Request } from '@nestjs/common';
import { ErrorHandlerService } from '../services/error-handler.service';

// Example service showing how to use the error handling system
@Injectable()
export class ExampleService {
  constructor(private readonly errorHandler: ErrorHandlerService) {}

  async findUser(userId: string, requestId?: string) {
    try {
      // Simulate database query
      const user = await this.simulateDatabaseQuery(userId);
      
      if (!user) {
        // Throw user-friendly error
        this.errorHandler.throwUserNotFound(userId, requestId);
      }

      return user;
    } catch (error) {
      // Re-throw if it's already our custom exception
      if (error instanceof Error && 'errorCode' in error) {
        throw error;
      }
      
      // Handle unexpected errors
      this.errorHandler.throwInternalServerError(
        { originalError: error.message },
        requestId
      );
    }
  }

  async createDebt(debtData: any, userId: string, requestId?: string) {
    try {
      // Validate debt amount
      if (debtData.amount <= 0) {
        this.errorHandler.throwInvalidDebtAmount(debtData.amount, requestId);
      }

      // Validate interest rate
      if (debtData.interestRate < 0 || debtData.interestRate > 100) {
        this.errorHandler.throwInvalidInterestRate(debtData.interestRate, requestId);
      }

      // Simulate database operation
      const debt = await this.simulateCreateDebt(debtData, userId);
      
      return debt;
    } catch (error) {
      // Handle database-specific errors
      if (error.message?.includes('duplicate')) {
        this.errorHandler.throwDuplicateEntry('name', debtData.name, requestId);
      }
      
      if (error.message?.includes('foreign key')) {
        this.errorHandler.throwForeignKeyViolation(
          { userId, error: error.message },
          requestId
        );
      }

      // Re-throw custom exceptions
      if (error instanceof Error && 'errorCode' in error) {
        throw error;
      }

      // Handle unexpected errors
      this.errorHandler.throwInternalServerError(
        { originalError: error.message },
        requestId
      );
    }
  }

  async processPayment(paymentData: any, debtId: string, requestId?: string) {
    try {
      // Validate payment amount
      if (paymentData.amount <= 0) {
        this.errorHandler.throwInvalidPaymentAmount(paymentData.amount, requestId);
      }

      // Get debt to check balance
      const debt = await this.simulateGetDebt(debtId);
      
      if (!debt) {
        this.errorHandler.throwDebtNotFound(debtId, requestId);
      }

      // Check if payment exceeds balance
      if (paymentData.amount > debt.currentBalance) {
        this.errorHandler.throwPaymentExceedsBalance(
          paymentData.amount,
          debt.currentBalance,
          requestId
        );
      }

      // Process payment
      const payment = await this.simulateProcessPayment(paymentData, debtId);
      
      return payment;
    } catch (error) {
      // Re-throw custom exceptions
      if (error instanceof Error && 'errorCode' in error) {
        throw error;
      }

      // Handle unexpected errors
      this.errorHandler.throwInternalServerError(
        { originalError: error.message },
        requestId
      );
    }
  }

  // Simulate external service call
  async callExternalService(serviceName: string, requestId?: string) {
    try {
      // Simulate external service call
      const result = await this.simulateExternalCall(serviceName);
      
      return result;
    } catch (error) {
      // Handle external service errors
      if (error.code === 'ECONNREFUSED') {
        this.errorHandler.throwExternalServiceUnavailable(serviceName, requestId);
      }
      
      if (error.code === 'ETIMEDOUT') {
        this.errorHandler.throwExternalServiceTimeout(serviceName, 5000, requestId);
      }

      this.errorHandler.throwExternalServiceError(
        serviceName,
        { error: error.message },
        requestId
      );
    }
  }

  // Simulate database operations
  private async simulateDatabaseQuery(userId: string) {
    // Simulate database query
    if (userId === 'non-existent') {
      return null;
    }
    return { id: userId, name: 'John Doe' };
  }

  private async simulateCreateDebt(debtData: any, userId: string) {
    // Simulate database creation
    if (debtData.name === 'duplicate') {
      throw new Error('duplicate key value violates unique constraint');
    }
    
    if (debtData.userId === 'invalid') {
      throw new Error('insert or update on table "debts" violates foreign key constraint');
    }

    return { id: 'debt-123', ...debtData, userId };
  }

  private async simulateGetDebt(debtId: string) {
    // Simulate getting debt
    if (debtId === 'non-existent') {
      return null;
    }
    return { id: debtId, currentBalance: 1000 };
  }

  private async simulateProcessPayment(paymentData: any, debtId: string) {
    // Simulate payment processing
    return { id: 'payment-123', ...paymentData, debtId };
  }

  private async simulateExternalCall(serviceName: string) {
    // Simulate external service call
    if (serviceName === 'unavailable') {
      throw { code: 'ECONNREFUSED' };
    }
    
    if (serviceName === 'timeout') {
      throw { code: 'ETIMEDOUT' };
    }

    return { success: true, data: 'external data' };
  }
}

// Example controller showing how to use the error handling system
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('users/:id')
  async getUser(@Param('id') id: string, @Request() req: any) {
    return this.exampleService.findUser(id, req.requestId);
  }

  @Get('debts/:id')
  async getDebt(@Param('id') id: string, @Request() req: any) {
    // Example of using error handler directly in controller
    if (!id) {
      this.exampleService['errorHandler'].throwRequiredField('id', req.requestId);
    }

    return this.exampleService.findUser(id, req.requestId);
  }
}

// Example of using custom exceptions directly
import { createNotFoundException, createValidationException } from '../exceptions';

export class DirectExceptionExample {
  async findResource(id: string, requestId?: string) {
    if (!id) {
      throw createValidationException('VALIDATION_REQUIRED_FIELD', { field: 'id' }, requestId);
    }

    const resource = await this.simulateFindResource(id);
    
    if (!resource) {
      throw createNotFoundException('NOT_FOUND', { resource: 'Resource', id }, requestId);
    }

    return resource;
  }

  private async simulateFindResource(id: string) {
    if (id === 'non-existent') {
      return null;
    }
    return { id, name: 'Resource' };
  }
} 