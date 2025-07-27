import { Injectable } from '@nestjs/common';
import { DebtsService } from '@/debts/debts.service';
import { PaymentsService } from '@/payments/payments.service';
import { BudgetService } from '@/budget/budget.service';

@Injectable()
export class ReportsService {
  constructor(
    private debtsService: DebtsService,
    private paymentsService: PaymentsService,
    private budgetService: BudgetService,
  ) {}

  async generateDebtSummaryReport(userId: string) {
    const debts = await this.debtsService.findAllByUser(userId);
    const summary = await this.debtsService.getDebtsSummary(userId);
    
    return {
      reportType: 'debt_summary',
      generatedAt: new Date(),
      summary,
      debts: debts.map(debt => ({
        name: debt.name,
        type: debt.type,
        originalAmount: debt.originalAmount,
        currentBalance: debt.currentBalance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment,
        status: debt.status,
        paymentProgress: debt.paymentProgress,
      })),
    };
  }

  async generatePaymentHistoryReport(userId: string, months: number = 12) {
    const payments = await this.paymentsService.getAllPayments(userId, 100);
    const stats = await this.paymentsService.getPaymentStats(userId, months);
    
    return {
      reportType: 'payment_history',
      generatedAt: new Date(),
      period: `Last ${months} months`,
      stats,
      payments: payments.map(payment => ({
        date: payment.paymentDate,
        amount: payment.amount,
        debtName: payment.debt.name,
        principalAmount: payment.principalAmount,
        interestAmount: payment.interestAmount,
        remainingBalance: payment.remainingBalance,
        type: payment.paymentType,
      })),
    };
  }

  async generateFinancialHealthReport(userId: string) {
    const debtSummary = await this.debtsService.getDebtsSummary(userId);
    const budgetAnalysis = await this.budgetService.getBudgetAnalysis(userId);
    const paymentStats = await this.paymentsService.getPaymentStats(userId, 6);
    
    // Calculate financial health score (0-100)
    let healthScore = 50; // Base score
    
    // Debt-to-income ratio impact
    const currentBudget = await this.budgetService.getCurrentBudget(userId);
    if (Number(currentBudget.monthlyIncome) > 0) {
      const debtToIncomeRatio = debtSummary.totalCurrentDebt / (Number(currentBudget.monthlyIncome) * 12);
      if (debtToIncomeRatio < 0.1) healthScore += 20;
      else if (debtToIncomeRatio < 0.3) healthScore += 10;
      else if (debtToIncomeRatio > 0.5) healthScore -= 20;
    }
    
    // Payment consistency impact
    if (paymentStats.paymentCount > 0) {
      healthScore += 15;
    }
    
    // Budget discipline impact
    if (budgetAnalysis.currentMonth.budgetVariance >= 0) {
      healthScore += 15;
    }
    
    // Progress impact
    if (debtSummary.debtReductionPercentage > 10) {
      healthScore += 20;
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    return {
      reportType: 'financial_health',
      generatedAt: new Date(),
      healthScore: Math.round(healthScore),
      healthGrade: this.getHealthGrade(healthScore),
      debtSummary,
      budgetHealth: budgetAnalysis.currentMonth,
      paymentConsistency: paymentStats,
      recommendations: this.generateHealthRecommendations(healthScore, debtSummary, budgetAnalysis),
    };
  }

  private getHealthGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  private generateHealthRecommendations(score: number, debtSummary: any, budgetAnalysis: any) {
    const recommendations = [];
    
    if (score < 60) {
      recommendations.push({
        priority: 'high',
        category: 'debt_management',
        message: 'Focus on reducing your debt burden through consistent payments',
      });
    }
    
    if (budgetAnalysis.currentMonth.budgetVariance < 0) {
      recommendations.push({
        priority: 'high',
        category: 'budgeting',
        message: 'Review and adjust your budget to reduce overspending',
      });
    }
    
    if (debtSummary.activeDebts > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'debt_consolidation',
        message: 'Consider consolidating multiple debts to simplify management',
      });
    }
    
    return recommendations;
  }
}