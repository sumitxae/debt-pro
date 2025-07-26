import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, MinLength, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @ApiProperty({ example: 'John', required: false })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 75000, required: false })
  monthlyIncome?: number;
}