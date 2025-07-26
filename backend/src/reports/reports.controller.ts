import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('debt-summary')
  @ApiOperation({ summary: 'Generate debt summary report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debt summary report generated successfully' })
  async getDebtSummary(@CurrentUser() user: User) {
    return this.reportsService.generateDebtSummaryReport(user.id);
  }

  @Get('payment-history')
  @ApiOperation({ summary: 'Generate payment history report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment history report generated successfully' })
  async getPaymentHistory(
    @CurrentUser() user: User,
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
  ) {
    return this.reportsService.generatePaymentHistoryReport(user.id, months);
  }

  @Get('financial-health')
  @ApiOperation({ summary: 'Generate financial health report' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Financial health report generated successfully' })
  async getFinancialHealth(@CurrentUser() user: User) {
    return this.reportsService.generateFinancialHealthReport(user.id);
  }
}