import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getAllPayments(@Request() req, @Query('limit') limit?: number) {
    const userId = req.user.id;
    return this.paymentsService.getAllPayments(userId, limit);
  }

  @Get('stats')
  async getPaymentStats(@Request() req, @Query('months') months?: number) {
    const userId = req.user.id;
    return this.paymentsService.getPaymentStats(userId, months);
  }

  @Get('monthly/:year/:month')
  async getMonthlyPayments(
    @Request() req,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    const userId = req.user.id;
    return this.paymentsService.getMonthlyPayments(userId, year, month);
  }

  @Get(':id')
  async getPaymentById(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.paymentsService.getPaymentById(userId, id);
  }

  @Post(':debtId')
  async recordPayment(
    @Request() req,
    @Param('debtId') debtId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const userId = req.user.id;
    return this.paymentsService.recordPayment(userId, debtId, createPaymentDto);
  }

  @Delete(':id')
  async deletePayment(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.paymentsService.deletePayment(userId, id);
  }
}