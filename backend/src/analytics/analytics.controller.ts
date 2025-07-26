import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { ProjectionQueryDto } from './dto/projection-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projection')
  @ApiOperation({ summary: 'Get debt payoff projections' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debt projection calculated successfully' })
  async getProjection(
    @CurrentUser() user: User,
    @Query() query: ProjectionQueryDto,
  ) {
    return this.analyticsService.calculateDebtProjection(user.id, query);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get user progress metrics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User progress retrieved successfully' })
  async getProgress(@CurrentUser() user: User) {
    return this.analyticsService.getUserProgress(user.id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard metrics retrieved successfully' })
  async getDashboard(@CurrentUser() user: User) {
    return this.analyticsService.getDashboardMetrics(user.id);
  }

  @Get('compare-strategies')
  @ApiOperation({ summary: 'Compare debt payoff strategies' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Strategy comparison completed successfully' })
  async compareStrategies(
    @CurrentUser() user: User,
    @Query() query: Omit<ProjectionQueryDto, 'strategy'>,
  ) {
    return this.analyticsService.comparePayoffStrategies(user.id, query);
  }
}