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
    // Set current balance to original amount for new debts
    const debtData = {
      ...createDebtDto,
      currentBalance: createDebtDto.originalAmount,
      user: { id: userId },
    };

    const debt = this.debtRepository.create(debtData);
    return this.debtRepository.save(debt);
  }

  async update(id: string, updateDebtDto: UpdateDebtDto, userId: string): Promise<Debt> {
    const debt = await this.findOne(id, userId);
    
    // Don't allow updating current balance directly - it should be updated through payments
    const { currentBalance, ...updateData } = updateDebtDto;
    
    Object.assign(debt, updateData);
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
    return this.paymentsService.findByDebt(debt.id);
  }

  async calculatePayoffProjection(id: string, userId: string, monthlyPayment?: number) {
    const debt = await this.findOne(id, userId);
    
    if (debt.status !== DebtStatus.ACTIVE) {
      return {
        monthsToPayoff: 0,
        totalInterestPaid: 0,
        payoffDate: null,
        totalAmountPaid: Number(debt.originalAmount) - Number(debt.currentBalance),
      };
    }

    const payment = monthlyPayment || Number(debt.minimumPayment);
    const balance = Number(debt.currentBalance);
    const monthlyRate = Number(debt.interestRate) / 100 / 12;

    if (payment <= balance * monthlyRate) {
      // Payment is less than or equal to interest - debt will never be paid off
      return {
        monthsToPayoff: Infinity,
        totalInterestPaid: Infinity,
        payoffDate: null,
        totalAmountPaid: Infinity,
        warning: 'Payment amount is too low to cover interest charges',
      };
    }

    let currentBalance = balance;
    let monthsToPayoff = 0;
    let totalInterestPaid = 0;

    while (currentBalance > 0.01 && monthsToPayoff < 600) { // Max 50 years
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = Math.min(payment - interestPayment, currentBalance);
      
      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      monthsToPayoff++;
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

    return {
      monthsToPayoff,
      totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
      payoffDate: payoffDate.toISOString().split('T')[0],
      totalAmountPaid: balance + totalInterestPaid,
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