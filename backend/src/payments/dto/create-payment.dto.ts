import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  Min,
} from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 5000, description: 'Payment amount' })
  amount: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ 
    example: '2024-01-15', 
    required: false, 
    description: 'Payment date (defaults to today)' 
  })
  paymentDate?: string;

  @IsOptional()
  @IsEnum(PaymentType)
  @ApiProperty({ 
    example: PaymentType.MANUAL, 
    enum: PaymentType, 
    required: false 
  })
  paymentType?: PaymentType;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'Extra payment from bonus', 
    required: false 
  })
  notes?: string;
}