import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private usersService: UsersService,
  ) {}

  async sendPaymentReminder(userId: string, debts: any[]) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user?.preferences?.notifications) return;

      const upcomingPayments = debts.filter(debt => {
        const dueDate = new Date(debt.dueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0;
      });

      if (upcomingPayments.length > 0) {
        // Log the notification instead of sending email
        this.logger.log(`Payment reminder for ${user.email}: ${upcomingPayments.length} upcoming payments`);
        this.logger.log(`Upcoming payments: ${JSON.stringify(upcomingPayments.map(d => ({ name: d.name, dueDate: d.dueDate, amount: d.minimumPayment })))}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process payment reminder: ${error.message}`);
    }
  }

  async sendBudgetAlert(userId: string, alertData: any) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user?.preferences?.notifications) return;

      // Log the notification instead of sending email
      this.logger.log(`Budget alert for ${user.email}: ${alertData.category} budget at ${alertData.percentage.toFixed(1)}%`);
      this.logger.log(`Budget details: Budgeted: ₹${alertData.budgeted}, Spent: ₹${alertData.actual}`);
    } catch (error) {
      this.logger.error(`Failed to process budget alert: ${error.message}`);
    }
  }

  async sendDebtPayoffCelebration(userId: string, debtName: string) {
    try {
      const user = await this.usersService.findById(userId);

      // Log the notification instead of sending email
      this.logger.log(`🎉 Debt payoff celebration for ${user.email}: Successfully paid off ${debtName}!`);
    } catch (error) {
      this.logger.error(`Failed to process debt payoff celebration: ${error.message}`);
    }
  }

  // Helper method to generate notification data for frontend
  generateNotificationData(type: 'payment_reminder' | 'budget_alert' | 'debt_payoff', data: any) {
    switch (type) {
      case 'payment_reminder':
        return {
          type: 'payment_reminder',
          title: 'Payment Reminder',
          message: `You have ${data.upcomingPayments.length} upcoming debt payments due in the next 3 days.`,
          data: data.upcomingPayments,
        };
      case 'budget_alert':
        return {
          type: 'budget_alert',
          title: 'Budget Alert',
          message: `You've used ${data.percentage.toFixed(1)}% of your ${data.category} budget this month.`,
          data: data,
        };
      case 'debt_payoff':
        return {
          type: 'debt_payoff',
          title: '🎉 Congratulations!',
          message: `You've successfully paid off your ${data.debtName}!`,
          data: data,
        };
      default:
        return null;
    }
  }
}