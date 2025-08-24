import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserGamification } from './user-gamification.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  earnedAt: Date;

  // Relations
  @ManyToOne(() => UserGamification, gamification => gamification.badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userGamificationId' })
  user: UserGamification;

  @ManyToOne(() => Badge, badge => badge.userBadges)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;
}