import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, ExpenseCategories } from './entities/budget.entity';
import { Transaction, ExpenseCategory } from './entities/transaction.entity';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getCurrentBudget(userId: string): Promise<Budget> {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    let budget = await this.budgetRepository.findOne({
      where: { user: { id: userId }, month, year },
      relations: ['user'],
    });

    if (!budget) {
      budget = await this.createDefaultBudget(userId, month, year);
    }

    // Calculate actual expenses from transactions
    const actualExpenses = await this.calculateActualExpenses(userId, month, year);
    budget.actualExpenses = actualExpenses;

    return budget;
  }

  async updateCurrentBudget(userId: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    let budget = await this.budgetRepository.findOne({
      where: { user: { id: userId }, month, year },
    });

    if (!budget) {
      budget = await this.createDefaultBudget(userId, month, year);
    }

    Object.assign(budget, updateBudgetDto);
    return this.budgetRepository.save(budget);
  }

  async getBudgetHistory(userId: string, months: number = 12): Promise<Budget[]> {
    const budgets = await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoin('budget.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('budget.year', 'DESC')
      .addOrderBy('budget.month', 'DESC')
      .limit(months)
      .getMany();

    // Calculate actual expenses for each budget
    for (const budget of budgets) {
      budget.actualExpenses = await this.calculateActualExpenses(
        userId,
        budget.month,
        budget.year,
      );
    }

    return budgets;
  }

  async addTransaction(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user: { id: userId },
      date: createTransactionDto.date ? new Date(createTransactionDto.date) : new Date(),
    });

    return this.transactionRepository.save(transaction);
  }

  async getTransactions(userId: string, month?: number, year?: number): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('transaction.date', 'DESC');

    if (month && year) {
      queryBuilder
        .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year });
    }

    return queryBuilder.getMany();
  }

  async getBudgetAnalysis(userId: string) {
    const currentBudget = await this.getCurrentBudget(userId);
    const previousBudgets = await this.getBudgetHistory(userId, 6);

    const totalBudgeted = currentBudget.totalBudgeted;
    const totalActual = currentBudget.totalActual;
    const availableForDebt = currentBudget.availableForDebt;
    const budgetVariance = currentBudget.budgetVariance;

    // Calculate trends
    const trends = this.calculateBudgetTrends(previousBudgets);

    return {
      currentMonth: {
        totalIncome: Number(currentBudget.monthlyIncome),
        totalBudgeted,
        totalActual,
        availableForDebt,
        budgetVariance,
        utilizationPercentage: totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0,
      },
      trends,
      recommendations: this.generateBudgetRecommendations(currentBudget, trends),
    };
  }

  private async calculateActualExpenses(userId: string, month: number, year: number): Promise<ExpenseCategories> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
      .getMany();

    const expenses: ExpenseCategories = {
      housing: 0,
      food: 0,
      transportation: 0,
      utilities: 0,
      entertainment: 0,
      healthcare: 0,
      miscellaneous: 0,
    };

    transactions.forEach(transaction => {
      if (expenses.hasOwnProperty(transaction.category)) {
        expenses[transaction.category] += Number(transaction.amount);
      }
    });

    return expenses;
  }

  private async createDefaultBudget(userId: string, month: number, year: number): Promise<Budget> {
    const defaultExpenses: ExpenseCategories = {
      housing: 0,
      food: 0,
      transportation: 0,
      utilities: 0,
      entertainment: 0,
      healthcare: 0,
      miscellaneous: 0,
    };

    const budget = this.budgetRepository.create({
      user: { id: userId },
      month,
      year,
      monthlyIncome: 0,
      expenses: defaultExpenses,
      actualExpenses: defaultExpenses,
    });

    return this.budgetRepository.save(budget);
  }

  private calculateBudgetTrends(budgets: Budget[]) {
    if (budgets.length < 2) return null;

    const categories = Object.keys(budgets[0].expenses) as (keyof ExpenseCategories)[];
    const trends: Record<string, any> = {};

    categories.forEach(category => {
      const values = budgets.map(b => b.actualExpenses[category] || 0);
      const recent = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      const older = values.slice(3, 6).reduce((sum, val) => sum + val, 0) / 3;

      trends[category] = {
        direction: recent > older ? 'increasing' : recent < older ? 'decreasing' : 'stable',
        percentageChange: older > 0 ? ((recent - older) / older) * 100 : 0,
      };
    });

    return trends;
  }

  private generateBudgetRecommendations(budget: Budget, trends: any) {
    const recommendations = [];

    // Check for overspending
    Object.entries(budget.expenses).forEach(([category, budgeted]) => {
      const actual = budget.actualExpenses[category as keyof ExpenseCategories];
      if (actual > budgeted * 1.1) { // 10% over budget
        recommendations.push({
          type: 'overspending',
          category,
          message: `You're spending ${((actual / budgeted - 1) * 100).toFixed(1)}% over budget on ${category}`,
          severity: 'high',
        });
      }
    });

    // Check trends
    if (trends) {
      Object.entries(trends).forEach(([category, trend]: [string, any]) => {
        if (trend.direction === 'increasing' && Math.abs(trend.percentageChange) > 20) {
          recommendations.push({
            type: 'trend',
            category,
            message: `Your ${category} expenses have increased by ${trend.percentageChange.toFixed(1)}% recently`,
            severity: 'medium',
          });
        }
      });
    }

    return recommendations;
  }
}