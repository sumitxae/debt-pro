import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { createValidationException } from '../exceptions';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Handle undefined or null values
    if (value === undefined || value === null) {
      return value;
    }

    try {
      const object = plainToClass(metatype, value);
      const errors = await validate(object);

      if (errors.length > 0) {
        const formattedErrors = this.formatValidationErrors(errors);
        throw createValidationException('VALIDATION_FAILED', formattedErrors);
      }

      return object;
    } catch (error) {
      // If it's already a validation exception, re-throw it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // For other errors, create a generic validation exception with more details
      console.error('Validation error details:', error);
      
      // Check if it's a class-validator error
      if (error.message && error.message.includes('class-validator')) {
        throw createValidationException('VALIDATION_FAILED', {
          general: ['Invalid data format or missing required fields']
        });
      }
      
      throw createValidationException('VALIDATION_FAILED', {
        general: [`An error occurred during validation: ${error.message}`]
      });
    }
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: ValidationError[]): any {
    const result: any = {};

    errors.forEach(error => {
      if (error.constraints) {
        result[error.property] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        const childErrors = this.formatValidationErrors(error.children);
        Object.keys(childErrors).forEach(key => {
          result[`${error.property}.${key}`] = childErrors[key];
        });
      }
    });

    return result;
  }
} 