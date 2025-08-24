import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt, DebtStatus } from './entities/debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { PaymentsService } from '@/payments/payments.service';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtRepository: Repository<Debt>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async findAllByUser(userId: string): Promise<Debt[]> {
    return this.debtRepository.find({
      where: { user: { id: userId } },
      relations: ['payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Debt> {
    const debt = await this.debtRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['payments', 'user'],
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return debt;
  }

  async create(createDebtDto: CreateDebtDto, userId: string): Promise<Debt> {
    // Use provided current balance or default to original amount
    const debtData = {
      ...createDebtDto,
      currentBalance: createDebtDto.currentBalance || createDebtDto.originalAmount,
      user: { id: userId },
    };

    const debt = this.debtRepository.create(debtData);
    return this.debtRepository.save(debt);
  }

  async update(id: string, updateDebtDto: UpdateDebtDto, userId: string): Promise<Debt> {
    const debt = await this.findOne(id, userId);
    
    // Allow updating current balance for debt editing
    Object.assign(debt, updateDebtDto);
    
    // Check if debt is paid off after balance update
    if (debt.currentBalance <= 0) {
      debt.status = DebtStatus.PAID_OFF;
      debt.currentBalance = 0;
    }
    
    return this.debtRepository.save(debt);
  }

  async remove(id: string, userId: string): Promise<void> {
    const debt = await this.findOne(id, userId);
    
    // Check if debt has payments - maybe warn user but allow deletion
    if (debt.payments && debt.payments.length > 0) {
      // In a real app, you might want to soft delete or require confirmation
      console.warn(`Deleting debt ${debt.name} with ${debt.payments.length} payments`);
    }
    
    await this.debtRepository.remove(debt);
  }

  async getPaymentHistory(id: string, userId: string) {
    const debt = await this.findOne(id, userId);
    return this.paymentsService.getMonthlyPayments(userId, new Date().getFullYear(), new Date().getMonth() + 1);
  }

  async calculatePayoffProjection(id: string, userId: string, customPayment?: number) {
    const debt = await this.findOne(id, userId);
    
    if (debt.status !== DebtStatus.ACTIVE) {
      return {
        intervalsToPayoff: 0,
        totalInterestPaid: 0,
        payoffDate: null,
        totalAmountPaid: Number(debt.originalAmount) - Number(debt.currentBalance),
      };
    }

    const payment = customPayment || Number(debt.minimumPayment);
    const balance = Number(debt.currentBalance);
    const annualRate = Number(debt.interestRate) / 100;
    
    // Calculate interval rate based on payment interval
    let intervalRate: number;
    let intervalsPerYear: number;
    
    switch (debt.paymentInterval) {
      case 'monthly':
        intervalRate = annualRate / 12;
        intervalsPerYear = 12;
        break;
      case 'half_yearly':
        intervalRate = annualRate / 2;
        intervalsPerYear = 2;
        break;
      case 'yearly':
        intervalRate = annualRate;
        intervalsPerYear = 1;
        break;
      default:
        intervalRate = annualRate / 12;
        intervalsPerYear = 12;
    }

    if (payment <= balance * intervalRate) {
      // Payment is less than or equal to interest - debt will never be paid off
      return {
        intervalsToPayoff: Infinity,
        totalInterestPaid: Infinity,
        payoffDate: null,
        totalAmountPaid: Infinity,
        warning: `Payment amount is too low to cover interest charges for ${debt.getIntervalDescription()} payments`,
      };
    }

    let currentBalance = balance;
    let intervalsToPayoff = 0;
    let totalInterestPaid = 0;
    const maxIntervals = 600; // Max 50 years for monthly, 25 years for half-yearly, etc.

    while (currentBalance > 0.01 && intervalsToPayoff < maxIntervals) {
      const interestPayment = currentBalance * intervalRate;
      const principalPayment = Math.min(payment - interestPayment, currentBalance);
      
      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      intervalsToPayoff++;
    }

    const payoffDate = new Date();
    if (debt.paymentInterval === 'monthly') {
      payoffDate.setMonth(payoffDate.getMonth() + intervalsToPayoff);
    } else if (debt.paymentInterval === 'half_yearly') {
      payoffDate.setMonth(payoffDate.getMonth() + (intervalsToPayoff * 6));
    } else if (debt.paymentInterval === 'yearly') {
      payoffDate.setFullYear(payoffDate.getFullYear() + intervalsToPayoff);
    }

    return {
      intervalsToPayoff,
      monthsToPayoff: Math.round((intervalsToPayoff / intervalsPerYear) * 12),
      totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
      payoffDate: payoffDate.toISOString().split('T')[0],
      totalAmountPaid: balance + totalInterestPaid,
      paymentInterval: debt.paymentInterval,
      intervalDescription: debt.getIntervalDescription(),
    };
  }

  async getDebtsSummary(userId: string) {
    const debts = await this.findAllByUser(userId);
    
    const activeDebts = debts.filter(debt => debt.status === DebtStatus.ACTIVE);
    const paidOffDebts = debts.filter(debt => debt.status === DebtStatus.PAID_OFF);
    
    const totalOriginalDebt = debts.reduce((sum, debt) => sum + Number(debt.originalAmount), 0);
    const totalCurrentDebt = activeDebts.reduce((sum, debt) => sum + Number(debt.currentBalance), 0);
    const totalMinimumPayments = activeDebts.reduce((sum, debt) => sum + Number(debt.minimumPayment), 0);
    
    const totalPaid = debts.reduce((sum, debt) => {
      return sum + (debt.payments?.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0) || 0);
    }, 0);

    // Group debts by payment interval for better insights
    const debtsByInterval = activeDebts.reduce((acc, debt) => {
      const interval = debt.paymentInterval;
      if (!acc[interval]) {
        acc[interval] = {
          count: 0,
          totalBalance: 0,
          totalMinimumPayment: 0,
        };
      }
      acc[interval].count++;
      acc[interval].totalBalance += Number(debt.currentBalance);
      acc[interval].totalMinimumPayment += Number(debt.minimumPayment);
      return acc;
    }, {});

    return {
      totalDebts: debts.length,
      activeDebts: activeDebts.length,
      paidOffDebts: paidOffDebts.length,
      totalOriginalDebt: Math.round(totalOriginalDebt * 100) / 100,
      totalCurrentDebt: Math.round(totalCurrentDebt * 100) / 100,
      totalMinimumPayments: Math.round(totalMinimumPayments * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      debtReductionPercentage: totalOriginalDebt > 0 
        ? Math.round(((totalOriginalDebt - totalCurrentDebt) / totalOriginalDebt) * 10000) / 100
        : 0,
      debtsByInterval,
    };
  }

  async updateDebtBalance(debtId: string, newBalance: number): Promise<Debt> {
    const debt = await this.debtRepository.findOne({ where: { id: debtId } });
    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    debt.currentBalance = newBalance;
    
    // Check if debt is paid off
    if (newBalance <= 0) {
      debt.status = DebtStatus.PAID_OFF;
      debt.currentBalance = 0;
    }

    return this.debtRepository.save(debt);
  }
}