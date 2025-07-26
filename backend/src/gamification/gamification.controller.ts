import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user gamification profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Gamification profile retrieved successfully' })
  async getProfile(@CurrentUser() user: User) {
    return this.gamificationService.getUserProfile(user.id);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get user badges' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User badges retrieved successfully' })
  async getBadges(@CurrentUser() user: User) {
    return this.gamificationService.getUserBadges(user.id);
  }

  @Get('available-badges')
  @ApiOperation({ summary: 'Get available badges to earn' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Available badges retrieved successfully' })
  async getAvailableBadges(@CurrentUser() user: User) {
    return this.gamificationService.getAvailableBadges(user.id);
  }
}