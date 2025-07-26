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
import { DebtType } from '../entities/debt.entity';

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

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({ example: 18.5, description: 'Annual interest rate in percentage' })
  interestRate: number;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 2500, description: 'Minimum monthly payment' })
  minimumPayment: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2024-01-15', required: false, description: 'Monthly due date' })
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