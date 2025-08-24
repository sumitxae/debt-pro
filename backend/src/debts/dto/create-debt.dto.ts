import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { DebtType, PaymentInterval } from '../entities/debt.entity';

export class CreateDebtDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'HDFC Credit Card' })
  name: string;

  @IsEnum(DebtType)
  @ApiProperty({ example: DebtType.CREDIT_CARD, enum: DebtType })
  type: DebtType;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 50000, description: 'Original debt amount' })
  originalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 45000, description: 'Current outstanding balance', required: false })
  currentBalance?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({ example: 18.5, description: 'Annual interest rate in percentage' })
  interestRate: number;

  @IsEnum(PaymentInterval)
  @ApiProperty({ 
    example: PaymentInterval.MONTHLY, 
    enum: PaymentInterval,
    description: 'Payment interval for minimum payments'
  })
  paymentInterval: PaymentInterval;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ 
    example: 2500, 
    description: 'Minimum payment amount for the specified interval (e.g., monthly, half-yearly, yearly)' 
  })
  minimumPayment: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2024-01-15', required: false, description: 'Due date for the payment interval' })
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 1, required: false, description: 'Priority for payoff strategy (lower = higher priority)' })
  priority?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Balance transfer from previous card', required: false })
  notes?: string;
}