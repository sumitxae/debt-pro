import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Budget')
@Controller('budget')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current month budget' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Current budget retrieved successfully' })
  async getCurrentBudget(@CurrentUser() user: User) {
    return this.budgetService.getCurrentBudget(user.id);
  }

  @Put('current')
  @ApiOperation({ summary: 'Update current month budget' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Budget updated successfully' })
  async updateCurrentBudget(
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser() user: User,
  ) {
    return this.budgetService.updateCurrentBudget(user.id, updateBudgetDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get budget history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Budget history retrieved successfully' })
  async getBudgetHistory(
    @CurrentUser() user: User,
    @Query('months') months?: string,
  ) {
    const monthsNumber = months ? parseInt(months, 10) : undefined;
    return this.budgetService.getBudgetHistory(user.id, monthsNumber);
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Get budget analysis and insights' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Budget analysis retrieved successfully' })
  async getBudgetAnalysis(@CurrentUser() user: User) {
    return this.budgetService.getBudgetAnalysis(user.id);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Add expense transaction' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction added successfully' })
  async addTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.budgetService.addTransaction(user.id, createTransactionDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get expense transactions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @CurrentUser() user: User,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const monthNumber = month ? parseInt(month, 10) : undefined;
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.budgetService.getTransactions(user.id, monthNumber, yearNumber);
  }
}