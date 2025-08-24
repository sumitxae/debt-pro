import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { createAuthException, createConflictException } from '@/common/exceptions/custom-exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw createConflictException('AUTH_USER_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user with default preferences
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      preferences: {
        currency: 'INR',
        notifications: true,
        defaultStrategy: 'snowball' as const,
        theme: 'light' as const,
      },
    };

    const user = await this.usersService.create(userData);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user || !user.isActive) {
      throw createAuthException('AUTH_INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createAuthException('AUTH_INVALID_CREDENTIALS');
    }

    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      this.logger.debug('Attempting to refresh access token');
      
      const payload = this.jwtService.verify(refreshToken);
      this.logger.debug(`Refresh token verified for user ID: ${payload.sub}`);
      
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        this.logger.warn(`Token refresh failed: User not found or inactive for ID ${payload.sub}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      this.logger.debug(`Token refresh successful for user: ${user.email}`);
      
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`Token refresh error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    };
  }

  private excludePassword(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}