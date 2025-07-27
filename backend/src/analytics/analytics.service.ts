import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt, DebtStatus } from '../debts/entities/debt.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboardAnalytics(userId: string) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId }, status: DebtStatus.ACTIVE },
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.currentBalance || 0), 0);
    const monthlyPayments = debts.reduce((sum, debt) => sum + Number(debt.minimumPayment || 0), 0);
    const averageInterestRate = debts.length > 0 
      ? debts.reduce((sum, debt) => sum + Number(debt.interestRate || 0), 0) / debts.length 
      : 0;

    // Calculate debt-to-income ratio
    const monthlyIncome = user?.monthlyIncome ? Number(user.monthlyIncome) : 0;
    const debtToIncomeRatio = monthlyIncome > 0 
      ? (monthlyPayments / monthlyIncome) * 100 
      : 0;

    // Calculate total interest saved (simplified calculation)
    const totalInterestSaved = debts.reduce((sum, debt) => {
      const originalInterest = Number(debt.originalAmount || 0) * (Number(debt.interestRate || 0) / 100);
      const currentInterest = Number(debt.currentBalance || 0) * (Number(debt.interestRate || 0) / 100);
      return sum + (originalInterest - currentInterest);
    }, 0);

    // Calculate projected payoff date (simplified)
    const estimatedPayoffDate = new Date();
    estimatedPayoffDate.setMonth(estimatedPayoffDate.getMonth() + Math.ceil(totalDebt / (monthlyPayments * 1.5 || 1)));

    return {
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      monthlyPaymentRatio: Math.round((monthlyPayments / (monthlyIncome || 1)) * 100 * 100) / 100,
      averageInterestRate: Math.round(averageInterestRate * 100) / 100,
      totalInterestSaved: Math.round(totalInterestSaved),
      projectedPayoffDate: estimatedPayoffDate.toISOString(),
      progressData: [],
    };
  }

  async getUserProgress(userId: string) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId } },
    });

    const totalOriginalDebt = debts.reduce((sum, debt) => sum + Number(debt.originalAmount || 0), 0);
    const totalCurrentDebt = debts.reduce((sum, debt) => sum + Number(debt.currentBalance || 0), 0);
    const totalPaidOff = totalOriginalDebt - totalCurrentDebt;
    const progressPercentage = totalOriginalDebt > 0 
      ? (totalPaidOff / totalOriginalDebt) * 100 
      : 0;

    const paidOffDebts = debts.filter(debt => debt.status === DebtStatus.PAID_OFF).length;
    const activeDebts = debts.filter(debt => debt.status === DebtStatus.ACTIVE).length;

    return {
      totalOriginalDebt,
      totalCurrentDebt,
      totalPaidOff,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      paidOffDebts,
      activeDebts,
      totalDebts: debts.length,
    };
  }

  async getProjection(userId: string, params: {
    strategy: string;
    monthlyPayment: number;
    extraPayment: number;
  }) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId }, status: DebtStatus.ACTIVE },
      order: params.strategy === 'avalanche' 
        ? { interestRate: 'DESC' } 
        : { currentBalance: 'ASC' },
    });

    const totalMonthlyPayment = params.monthlyPayment + params.extraPayment;
    const minimumPayments = debts.reduce((sum, debt) => sum + Number(debt.minimumPayment || 0), 0);
    const extraPayment = totalMonthlyPayment - minimumPayments;

    if (extraPayment <= 0) {
      return {
        strategy: params.strategy,
        monthlyPayment: totalMonthlyPayment,
        totalDebt: debts.reduce((sum, debt) => sum + Number(debt.currentBalance || 0), 0),
        estimatedPayoffDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalInterest: 0,
        totalPayments: 0,
        debtOrder: [],
      };
    }

    // Simplified projection calculation
    const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.currentBalance || 0), 0);
    const monthsToPayoff = Math.ceil(totalDebt / extraPayment);
    const estimatedPayoffDate = new Date();
    estimatedPayoffDate.setMonth(estimatedPayoffDate.getMonth() + monthsToPayoff);

    const debtOrder = debts.map(debt => ({
      debtId: debt.id,
      name: debt.name,
      currentBalance: Number(debt.currentBalance || 0),
      minimumPayment: Number(debt.minimumPayment || 0),
      interestRate: Number(debt.interestRate || 0),
    }));

    return {
      strategy: params.strategy,
      monthlyPayment: totalMonthlyPayment,
      totalDebt,
      estimatedPayoffDate: estimatedPayoffDate.toISOString(),
      totalInterest: debts.reduce((sum, debt) => sum + (debt.currentBalance * debt.interestRate / 100), 0),
      totalPayments: totalDebt,
      debtOrder,
    };
  }

  async compareStrategies(userId: string, params: {
    monthlyPayment: number;
    extraPayment: number;
  }) {
    const avalanche = await this.getProjection(userId, {
      strategy: 'avalanche',
      monthlyPayment: params.monthlyPayment,
      extraPayment: params.extraPayment,
    });

    const snowball = await this.getProjection(userId, {
      strategy: 'snowball',
      monthlyPayment: params.monthlyPayment,
      extraPayment: params.extraPayment,
    });

    const recommendation = avalanche.totalInterest < snowball.totalInterest ? 'avalanche' : 'snowball';
    const savings = Math.abs(avalanche.totalInterest - snowball.totalInterest);

    return {
      avalanche,
      snowball,
      recommendation,
      savings: Math.round(savings),
    };
  }
}