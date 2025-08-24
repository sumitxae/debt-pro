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
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Debts')
@Controller('debts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user debts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debts retrieved successfully' })
  async findAll(@CurrentUser() user: User) {
    return this.debtsService.findAllByUser(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get debts summary statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debts summary retrieved successfully' })
  async getSummary(@CurrentUser() user: User) {
    return this.debtsService.getDebtsSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debt retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Debt not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.debtsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new debt' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Debt created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(
    @Body() createDebtDto: CreateDebtDto,
    @CurrentUser() user: User,
  ) {
    return this.debtsService.create(createDebtDto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update debt' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debt updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Debt not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDebtDto: UpdateDebtDto,
    @CurrentUser() user: User,
  ) {
    return this.debtsService.update(id, updateDebtDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete debt' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Debt deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Debt not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.debtsService.remove(id, user.id);
    return { message: 'Debt deleted successfully' };
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get payment history for debt' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment history retrieved successfully' })
  async getPayments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.debtsService.getPaymentHistory(id, user.id);
  }

  @Get(':id/projection')
  @ApiOperation({ summary: 'Get payoff projection for debt' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payoff projection calculated successfully' })
  async getProjection(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Query('monthlyPayment') monthlyPayment?: string,
  ) {
    const monthlyPaymentNumber = monthlyPayment ? parseFloat(monthlyPayment) : undefined;
    return this.debtsService.calculatePayoffProjection(id, user.id, monthlyPaymentNumber);
  }
}