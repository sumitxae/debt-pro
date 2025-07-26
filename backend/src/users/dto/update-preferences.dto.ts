import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'INR', required: false })
  currency?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  notifications?: boolean;

  @IsOptional()
  @IsEnum(['snowball', 'avalanche'])
  @ApiProperty({ example: 'snowball', enum: ['snowball', 'avalanche'], required: false })
  defaultStrategy?: 'snowball' | 'avalanche';

  @IsOptional()
  @IsEnum(['light', 'dark'])
  @ApiProperty({ example: 'light', enum: ['light', 'dark'], required: false })
  theme?: 'light' | 'dark';
}