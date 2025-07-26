import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt, DebtStatus } from '@/debts/entities/debt.entity';
import { Payment } from '@/payments/entities/payment.entity';
import { Budget } from '@/budget/entities/budget.entity';
import { ProjectionQueryDto } from './dto/projection-query.dto';

export interface MonthlyProjection {
  month: string;
  payments: DebtPayment[];
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
}

export interface DebtPayment {
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Debt)
    private debtRepository: Repository<Debt>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async calculateDebtProjection(userId: string, query: ProjectionQueryDto) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId }, status: DebtStatus.ACTIVE },
      order: { priority: 'ASC' },
    });

    if (debts.length === 0) {
      return {
        strategy: query.strategy || 'snowball',
        monthlySchedule: [],
        totalInterestPaid: 0,
        debtFreeDate: null,
        monthsToPayoff: 0,
      };
    }

    const projection = await this.generateProjectionData(debts, query);
    return projection;
  }

  private async generateProjectionData(debts: Debt[], query: ProjectionQueryDto) {
    const {
      strategy = 'snowball',
      monthlyExtra = 0,
      lumpSums = [],
    } = query;

    // Sort debts based on strategy
    const sortedDebts = this.sortDebtsByStrategy(debts, strategy);

    const monthlySchedule: MonthlyProjection[] = [];
    const debtBalances = new Map(sortedDebts.map(d => [d.id, Number(d.currentBalance)]));

    let currentDate = new Date();
    let totalInterestPaid = 0;
    let debtFreeDate = null;

    while (debtBalances.size > 0 && monthlySchedule.length < 600) { // Max 50 years
      const monthPayments: DebtPayment[] = [];
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      // Check for lump sum in this month
      const lumpSum = lumpSums.find(ls => ls.month === monthYear);
      let availableExtra = monthlyExtra + (lumpSum?.amount || 0);

      for (const debt of sortedDebts) {
        if (!debtBalances.has(debt.id)) continue;

        const balance = debtBalances.get(debt.id)!;
        if (balance <= 0) {
          debtBalances.delete(debt.id);
          continue;
        }

        // Calculate monthly interest
        const monthlyInterestRate = Number(debt.interestRate) / 100 / 12;
        const interest = balance * monthlyInterestRate;
        totalInterestPaid += interest;

        // Calculate payment
        let payment = Number(debt.minimumPayment);
        if (availableExtra > 0) {
          payment += availableExtra;
          availableExtra = 0;
        }

        // Calculate principal
        const principal = Math.min(payment - interest, balance);
        const newBalance = balance - principal;

        monthPayments.push({
          debtId: debt.id,
          debtName: debt.name,
          payment,
          principal,
          interest,
          remainingBalance: newBalance,
        });

        debtBalances.set(debt.id, newBalance);

        if (newBalance <= 0) {
          debtBalances.delete(debt.id);
        }
      }

      monthlySchedule.push({
        month: monthYear,
        payments: monthPayments,
        totalPayment: monthPayments.reduce((sum, p) => sum + p.payment, 0),
        totalInterest: monthPayments.reduce((sum, p) => sum + p.interest, 0),
        totalPrincipal: monthPayments.reduce((sum, p) => sum + p.principal, 0),
      });

      if (debtBalances.size === 0) {
        debtFreeDate = monthYear;
        break;
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      strategy,
      monthlySchedule,
      totalInterestPaid,
      debtFreeDate,
      monthsToPayoff: monthlySchedule.length,
    };
  }

  private sortDebtsByStrategy(debts: Debt[], strategy: string): Debt[] {
    switch (strategy) {
      case 'snowball':
        return [...debts].sort((a, b) => Number(a.currentBalance) - Number(b.currentBalance));
      case 'avalanche':
        return [...debts].sort((a, b) => Number(b.interestRate) - Number(a.interestRate));
      case 'custom':
        return [...debts].sort((a, b) => a.priority - b.priority);
      default:
        return debts;
    }
  }

  async getUserProgress(userId: string) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId } },
      relations: ['payments'],
    });

    const totalOriginalDebt = debts.reduce((sum, d) => sum + Number(d.originalAmount), 0);
    const totalCurrentDebt = debts
      .filter(d => d.status === DebtStatus.ACTIVE)
      .reduce((sum, d) => sum + Number(d.currentBalance), 0);

    const totalPaidOff = totalOriginalDebt - totalCurrentDebt;
    const progressPercentage = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

    const paidOffDebts = debts.filter(d => d.status === DebtStatus.PAID_OFF).length;
    const activeDebts = debts.filter(d => d.status === DebtStatus.ACTIVE).length;

    return {
      totalOriginalDebt: Math.round(totalOriginalDebt * 100) / 100,
      totalCurrentDebt: Math.round(totalCurrentDebt * 100) / 100,
      totalPaidOff: Math.round(totalPaidOff * 100) / 100,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      paidOffDebts,
      activeDebts,
      totalDebts: debts.length,
    };
  }

  async getDashboardMetrics(userId: string) {
    const progress = await this.getUserProgress(userId);
    const currentBudget = await this.budgetRepository.findOne({
      where: {
        user: { id: userId },
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });

    const thisMonthPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM payment.paymentDate) = :month', {
        month: new Date().getMonth() + 1,
      })
      .andWhere('EXTRACT(YEAR FROM payment.paymentDate) = :year', {
        year: new Date().getFullYear(),
      })
      .getMany();

    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    let budgetAvailable = 0;
    if (currentBudget) {
      const totalExpenses = Object.values(currentBudget.expenses).reduce(
        (sum: number, exp: number) => sum + exp,
        0,
      );
      budgetAvailable = Number(currentBudget.monthlyIncome) - totalExpenses;
    }

    return {
      ...progress,
      thisMonthPayments: Math.round(thisMonthTotal * 100) / 100,
      budgetAvailable: Math.round(budgetAvailable * 100) / 100,
    };
  }

  async comparePayoffStrategies(userId: string, query: Omit<ProjectionQueryDto, 'strategy'>) {
    const strategies = ['snowball', 'avalanche'];
    const comparisons = [];

    for (const strategy of strategies) {
      const projection = await this.calculateDebtProjection(userId, {
        ...query,
        strategy,
      });

      comparisons.push({
        strategy,
        monthsToPayoff: projection.monthsToPayoff,
        totalInterestPaid: projection.totalInterestPaid,
        debtFreeDate: projection.debtFreeDate,
        totalPayments: projection.monthlySchedule.reduce(
          (sum: number, month: MonthlyProjection) => sum + month.totalPayment,
          0,
        ),
      });
    }

    return {
      comparisons,
      recommendation: this.getStrategyRecommendation(comparisons),
    };
  }

  private getStrategyRecommendation(comparisons: any[]) {
    const snowball = comparisons.find(c => c.strategy === 'snowball');
    const avalanche = comparisons.find(c => c.strategy === 'avalanche');

    if (!snowball || !avalanche) return null;

    const interestSavings = snowball.totalInterestPaid - avalanche.totalInterestPaid;
    const timeDifference = snowball.monthsToPayoff - avalanche.monthsToPayoff;

    return {
      recommended: interestSavings > 1000 ? 'avalanche' : 'snowball',
      reason:
        interestSavings > 1000
          ? `Avalanche method saves ₹${interestSavings.toFixed(2)} in interest`
          : 'Snowball method provides better psychological motivation',
      interestSavings: Math.round(interestSavings * 100) / 100,
      timeDifference,
    };
  }
}