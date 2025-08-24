import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ExpensesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 25000, required: false })
  housing?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 8000, required: false })
  food?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 5000, required: false })
  transportation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 3000, required: false })
  utilities?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 4000, required: false })
  entertainment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 2000, required: false })
  healthcare?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 3000, required: false })
  miscellaneous?: number;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 2000, required: false })
  homeContribution?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExpensesDto)
  @ApiProperty({ type: ExpensesDto, required: false })
  expenses?: ExpensesDto;
}