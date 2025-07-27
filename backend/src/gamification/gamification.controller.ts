import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile')
  async getGamificationProfile(@Request() req) {
    const userId = req.user.id;
    return this.gamificationService.getUserProfile(userId);
  }

  @Get('badges')
  async getUserBadges(@Request() req) {
    const userId = req.user.id;
    return this.gamificationService.getUserBadges(userId);
  }

  @Get('available-badges')
  async getAvailableBadges(@Request() req) {
    const userId = req.user.id;
    return this.gamificationService.getAvailableBadges(userId);
  }
}