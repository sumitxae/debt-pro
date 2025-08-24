import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { UserBadge } from './user-badge.entity';

export enum BadgeCategory {
  PAYMENT = 'payment',
  DEBT_PAYOFF = 'debt_payoff',
  BUDGET = 'budget',
  MILESTONE = 'milestone',
  CONSISTENCY = 'consistency',
}

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  iconUrl: string;

  @Column({ type: 'int' })
  pointsRequired: number;

  @Column({
    type: 'enum',
    enum: BadgeCategory,
  })
  category: BadgeCategory;

  @OneToMany(() => UserBadge, userBadge => userBadge.badge)
  userBadges: UserBadge[];
}