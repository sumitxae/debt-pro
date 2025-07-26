import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 1500 })
  amount: number;

  @IsEnum(ExpenseCategory)
  @ApiProperty({ example: ExpenseCategory.FOOD, enum: ExpenseCategory })
  category: ExpenseCategory;

  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Grocery shopping at BigBasket' })
  description: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2024-01-15', required: false })
  date?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Weekly grocery shopping', required: false })
  notes?: string;
}