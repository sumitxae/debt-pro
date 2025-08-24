import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { ERROR_CODES } from '@/common/exceptions/error-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      // Log token validation attempt (without sensitive data)
      this.logger.debug(`Validating JWT token for user ID: ${payload.sub}`);

      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        this.logger.warn(`JWT validation failed: User not found for ID ${payload.sub}`);
        throw new UnauthorizedException({
          errorCode: ERROR_CODES.AUTH_INVALID_TOKEN.code,
          message: ERROR_CODES.AUTH_INVALID_TOKEN.message,
        });
      }

      if (!user.isActive) {
        this.logger.warn(`JWT validation failed: Inactive user ${payload.sub}`);
        throw new UnauthorizedException({
          errorCode: ERROR_CODES.AUTH_INVALID_TOKEN.code,
          message: ERROR_CODES.AUTH_INVALID_TOKEN.message,
        });
      }

      this.logger.debug(`JWT validation successful for user: ${user.email}`);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException({
        errorCode: ERROR_CODES.AUTH_INVALID_TOKEN.code,
        message: ERROR_CODES.AUTH_INVALID_TOKEN.message,
      });
    }
  }
}