import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt, DebtStatus } from '../debts/entities/debt.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: string) {
    try {
      const debts = await this.debtRepository.find({
        where: { user: { id: userId } },
      });

      const payments = await this.paymentRepository.find({
        where: { user: { id: userId } },
      });

      // Calculate points based on achievements
      let totalPoints = 0;
      let level = 1;
      let experience = 0;
      let experienceToNextLevel = 1000;

      // Points for debt payments
      totalPoints += payments.length * 10;

      // Points for debt reduction
      const totalPaidOff = debts.reduce((sum, debt) => {
        return sum + ((debt.originalAmount || 0) - (debt.currentBalance || 0));
      }, 0);
      totalPoints += Math.floor(totalPaidOff / 1000) * 50;

      // Points for paid off debts
      const paidOffDebts = debts.filter(debt => debt.status === DebtStatus.PAID_OFF).length;
      totalPoints += paidOffDebts * 100;

      // Calculate level based on points
      level = Math.floor(totalPoints / 1000) + 1;
      experience = totalPoints % 1000;
      experienceToNextLevel = 1000;

      // Calculate streak (simplified)
      const streakDays = Math.min(payments.length, 30);

      return {
        userId,
        points: totalPoints,
        level,
        experience,
        experienceToNextLevel,
        streak: streakDays,
        totalPayments: payments.length,
        totalPaidOff: Math.round(totalPaidOff),
        nextMilestone: {
          name: this.getNextMilestoneName(level),
          pointsRequired: experienceToNextLevel,
          currentProgress: (experience / experienceToNextLevel) * 100,
        },
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      // Return default data if there's an error
      return {
        userId,
        points: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 1000,
        streak: 0,
        totalPayments: 0,
        totalPaidOff: 0,
        nextMilestone: {
          name: 'Debt Warrior',
          pointsRequired: 1000,
          currentProgress: 0,
        },
      };
    }
  }

  async getUserBadges(userId: string) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId } },
    });

    const payments = await this.paymentRepository.find({
      where: { user: { id: userId } },
    });

    const badges = [];

    // First Payment Badge
    if (payments.length > 0) {
      badges.push({
        id: '1',
        name: 'First Payment',
        description: 'Made your first debt payment',
        icon: '🎯',
        earnedAt: payments[0].createdAt.toISOString(),
        rarity: 'COMMON',
      });
    }

    // Consistent Payer Badge
    if (payments.length >= 3) {
      badges.push({
        id: '2',
        name: 'Consistent Payer',
        description: 'Make payments 3 months in a row',
        icon: '🎯',
        earnedAt: payments[2].createdAt.toISOString(),
        rarity: 'RARE',
      });
    }

    // Debt Eliminator Badge
    const paidOffDebts = debts.filter(debt => debt.status === DebtStatus.PAID_OFF);
    if (paidOffDebts.length > 0) {
      badges.push({
        id: '3',
        name: 'Debt Eliminator',
        description: 'Pay off your first debt completely',
        icon: '🏆',
        earnedAt: paidOffDebts[0].updatedAt.toISOString(),
        rarity: 'EPIC',
      });
    }

    // Budget Master Badge (simplified)
    if (payments.length >= 6) {
      badges.push({
        id: '4',
        name: 'Budget Master',
        description: 'Stay under budget for 2 months',
        icon: '🏆',
        earnedAt: payments[5].createdAt.toISOString(),
        rarity: 'RARE',
      });
    }

    return badges;
  }

  async getAvailableBadges(userId: string) {
    const debts = await this.debtRepository.find({
      where: { user: { id: userId } },
    });

    const payments = await this.paymentRepository.find({
      where: { user: { id: userId } },
    });

    const availableBadges = [];

    // Debt Free Badge
    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const progress = totalDebt > 0 ? ((debts.reduce((sum, debt) => sum + debt.originalAmount, 0) - totalDebt) / debts.reduce((sum, debt) => sum + debt.originalAmount, 0)) * 100 : 0;

    availableBadges.push({
      id: '5',
      name: 'Debt Free',
      description: 'Pay off all your debts',
      icon: '🏆',
      rarity: 'LEGENDARY',
      progress: Math.round(progress),
      requirements: {
        totalDebt: 0,
        payments: 100,
      },
    });

    // Payment Master Badge
    const paymentProgress = Math.min((payments.length / 50) * 100, 100);
    availableBadges.push({
      id: '6',
      name: 'Payment Master',
      description: 'Make 50 debt payments',
      icon: '🎯',
      rarity: 'EPIC',
      progress: Math.round(paymentProgress),
      requirements: {
        totalDebt: 0,
        payments: 50,
      },
    });

    return availableBadges;
  }

  private getNextMilestoneName(level: number): string {
    const milestones = [
      'Debt Warrior',
      'Payment Pro',
      'Budget Master',
      'Debt Destroyer',
      'Financial Freedom Fighter',
      'Debt-Free Champion',
    ];
    return milestones[Math.min(level - 1, milestones.length - 1)];
  }
}