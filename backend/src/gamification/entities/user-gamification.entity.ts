import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { UserBadge } from './user-badge.entity';

@Entity('user_gamification')
export class UserGamification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 1 })
  currentLevel: number;

  @Column({ type: 'int', default: 0 })
  currentLevelPoints: number;

  @Column({ type: 'int', default: 0 })
  totalDebtsPayoff: number;

  @Column({ type: 'int', default: 0 })
  consecutivePaymentMonths: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmountPaid: number;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, user => user.gamification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => UserBadge, badge => badge.user)
  badges: UserBadge[];
}