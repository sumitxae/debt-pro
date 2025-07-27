import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardAnalytics(@Request() req) {
    const userId = req.user.id;
    return this.analyticsService.getDashboardAnalytics(userId);
  }

  @Get('progress')
  async getUserProgress(@Request() req) {
    const userId = req.user.id;
    return this.analyticsService.getUserProgress(userId);
  }

  @Get('projection')
  async getProjection(
    @Request() req,
    @Query('strategy') strategy: string = 'avalanche',
    @Query('monthlyPayment') monthlyPayment: number,
    @Query('extraPayment') extraPayment: number = 0,
  ) {
    const userId = req.user.id;
    return this.analyticsService.getProjection(userId, {
      strategy,
      monthlyPayment: Number(monthlyPayment),
      extraPayment: Number(extraPayment),
    });
  }

  @Get('compare-strategies')
  async compareStrategies(
    @Request() req,
    @Query('monthlyPayment') monthlyPayment: number,
    @Query('extraPayment') extraPayment: number = 0,
  ) {
    const userId = req.user.id;
    return this.analyticsService.compareStrategies(userId, {
      monthlyPayment: Number(monthlyPayment),
      extraPayment: Number(extraPayment),
    });
  }
}