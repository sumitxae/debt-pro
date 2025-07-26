import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LumpSumDto {
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 25000 })
  amount: number;

  @IsString()
  @ApiProperty({ example: '2024-06', description: 'Month in YYYY-MM format' })
  month: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Annual bonus', required: false })
  description?: string;
}

export class ProjectionQueryDto {
  @IsOptional()
  @IsEnum(['snowball', 'avalanche', 'custom'])
  @ApiProperty({ 
    example: 'snowball', 
    enum: ['snowball', 'avalanche', 'custom'], 
    required: false 
  })
  strategy?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 5000, required: false })
  monthlyExtra?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LumpSumDto)
  @ApiProperty({ type: [LumpSumDto], required: false })
  lumpSums?: LumpSumDto[];
}