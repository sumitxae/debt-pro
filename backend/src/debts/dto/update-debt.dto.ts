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
import { DebtType, DebtStatus, PaymentInterval } from '../entities/debt.entity';

export class UpdateDebtDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'HDFC Credit Card', required: false })
  name?: string;

  @IsOptional()
  @IsEnum(DebtType)
  @ApiProperty({ example: DebtType.CREDIT_CARD, enum: DebtType, required: false })
  type?: DebtType;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 50000, required: false })
  originalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({ example: 18.5, required: false })
  interestRate?: number;

  @IsOptional()
  @IsEnum(PaymentInterval)
  @ApiProperty({ 
    example: PaymentInterval.MONTHLY, 
    enum: PaymentInterval,
    description: 'Payment interval for minimum payments',
    required: false 
  })
  paymentInterval?: PaymentInterval;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ 
    example: 2500, 
    description: 'Minimum payment amount for the specified interval',
    required: false 
  })
  minimumPayment?: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2024-01-15', required: false })
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 1, required: false })
  priority?: number;

  @IsOptional()
  @IsEnum(DebtStatus)
  @ApiProperty({ example: DebtStatus.ACTIVE, enum: DebtStatus, required: false })
  status?: DebtStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Updated notes', required: false })
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 45000, required: false, description: 'Current balance - typically updated through payments' })
  currentBalance?: number;
}