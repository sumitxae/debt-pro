import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsString()
  @MinLength(2)
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
  @MinLength(2)
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @ApiProperty({ example: 'StrongPass123', description: 'Must contain uppercase, lowercase, and number' })
  password: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 50000, required: false })
  monthlyIncome?: number;
}