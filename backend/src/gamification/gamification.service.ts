import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { UserGamification } from './entities/user-gamification.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserGamification)
    private userGamificationRepository: Repository<UserGamification>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
  ) {}

  async getUserProfile(userId: string) {
    let profile = await this.userGamificationRepository.findOne({
      where: { user: { id: userId } },
      relations: ['badges', 'badges.badge'],
    });

    if (!profile) {
      profile = await this.initializeUserGamification(userId);
    }

    const level = this.calculateLevel(profile.totalPoints);
    const nextLevelPoints = this.getPointsForLevel(level + 1);
    const currentLevelPoints = this.getPointsForLevel(level);

    return {
      ...profile,
      currentLevel: level,
      pointsToNextLevel: nextLevelPoints - profile.totalPoints,
      progressToNextLevel: ((profile.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100,
    };
  }

  async addPoints(userId: string, points: number, reason?: string) {
    let profile = await this.userGamificationRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      profile = await this.initializeUserGamification(userId);
    }

    const oldLevel = this.calculateLevel(profile.totalPoints);
    profile.totalPoints += points;
    const newLevel = this.calculateLevel(profile.totalPoints);

    if (newLevel > oldLevel) {
      // Check for level-based badges
      await this.checkAndAwardBadge(userId, `LEVEL_${newLevel}`);
    }

    await this.userGamificationRepository.save(profile);

    return {
      pointsAdded: points,
      totalPoints: profile.totalPoints,
      leveledUp: newLevel > oldLevel,
      newLevel: newLevel > oldLevel ? newLevel : null,
    };
  }

  async checkAndAwardBadge(userId: string, badgeKey: string) {
    const badge = await this.badgeRepository.findOne({
      where: { key: badgeKey },
    });

    if (!badge) return null;

    // Check if user already has this badge
    const existingBadge = await this.userBadgeRepository.findOne({
      where: {
        user: { user: { id: userId } },
        badge: { id: badge.id },
      },
    });

    if (existingBadge) return null;

    // Award the badge
    const userBadge = this.userBadgeRepository.create({
      user: { user: { id: userId } },
      badge: { id: badge.id },
    });

    await this.userBadgeRepository.save(userBadge);

    // Add bonus points for earning badge
    await this.addPoints(userId, badge.pointsRequired, `Earned badge: ${badge.name}`);

    return {
      badge,
      earnedAt: userBadge.earnedAt,
    };
  }

  async getUserBadges(userId: string) {
    return this.userBadgeRepository.find({
      where: { user: { user: { id: userId } } },
      relations: ['badge'],
      order: { earnedAt: 'DESC' },
    });
  }

  async getAvailableBadges(userId: string) {
    const userBadges = await this.getUserBadges(userId);
    const earnedBadgeIds = userBadges.map(ub => ub.badge.id);

    return this.badgeRepository.find({
      where: earnedBadgeIds.length > 0 ? { id: Not(In(earnedBadgeIds)) } : {},
      order: { pointsRequired: 'ASC' },
    });
  }

  private calculateLevel(points: number): number {
    // Level calculation: Level = sqrt(points / 1000) + 1
    return Math.floor(Math.sqrt(points / 1000)) + 1;
  }

  private getPointsForLevel(level: number): number {
    // Points required for level: (level - 1)^2 * 1000
    return Math.pow(level - 1, 2) * 1000;
  }

  private async initializeUserGamification(userId: string): Promise<UserGamification> {
    const profile = this.userGamificationRepository.create({
      user: { id: userId },
      totalPoints: 0,
      currentLevel: 1,
      currentLevelPoints: 0,
      totalDebtsPayoff: 0,
      consecutivePaymentMonths: 0,
      totalAmountPaid: 0,
    });

    return this.userGamificationRepository.save(profile);
  }
}