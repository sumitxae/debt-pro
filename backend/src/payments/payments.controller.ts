import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { DebtsService } from '@/debts/debts.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => DebtsService))
    private readonly debtsService: DebtsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment history retrieved successfully' })
  async findAll(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findByUser(user.id, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment statistics retrieved successfully' })
  async getStats(
    @CurrentUser() user: User,
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
  ) {
    return this.paymentsService.getPaymentStats(user.id, months);
  }

  @Get('monthly/:year/:month')
  @ApiOperation({ summary: 'Get payments for specific month' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Monthly payments retrieved successfully' })
  async getMonthlyPayments(
    @CurrentUser() user: User,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.paymentsService.getMonthlyPayments(user.id, year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.findById(id, user.id);
  }

  @Post(':debtId')
  @ApiOperation({ summary: 'Record payment for debt' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment recorded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Debt not found' })
  async create(
    @Param('debtId', ParseUUIDPipe) debtId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: User,
  ) {
    // Get debt to calculate interest and principal
    const debt = await this.debtsService.findOne(debtId, user.id);
    
    // Calculate interest and principal portions
    const monthlyInterestRate = Number(debt.interestRate) / 100 / 12;
    const interestAmount = Number(debt.currentBalance) * monthlyInterestRate;
    const principalAmount = Math.max(0, createPaymentDto.amount - interestAmount);
    const remainingBalance = Math.max(0, Number(debt.currentBalance) - principalAmount);

    // Create payment record
    const payment = await this.paymentsService.create({
      ...createPaymentDto,
      debtId,
      userId: user.id,
      interestAmount: Math.round(interestAmount * 100) / 100,
      principalAmount: Math.round(principalAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
    });

    // Update debt balance
    await this.debtsService.updateDebtBalance(debtId, remainingBalance);

    return payment;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.paymentsService.delete(id, user.id);
    return { message: 'Payment deleted successfully' };
  }
}