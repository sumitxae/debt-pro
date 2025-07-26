import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Debt } from '@/debts/entities/debt.entity';
import { Payment } from '@/payments/entities/payment.entity';
import { Budget } from '@/budget/entities/budget.entity';
import { Transaction } from '@/budget/entities/transaction.entity';
import { UserGamification } from '@/gamification/entities/user-gamification.entity';

export interface UserPreferences {
  currency: string;
  notifications: boolean;
  defaultStrategy: 'snowball' | 'avalanche';
  theme: 'light' | 'dark';
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyIncome: number;

  @Column({ type: 'json', nullable: true })
  preferences: UserPreferences;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Debt, debt => debt.user)
  debts: Debt[];

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];

  @OneToMany(() => Budget, budget => budget.user)
  budgets: Budget[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToOne(() => UserGamification, gamification => gamification.user)
  gamification: UserGamification;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}