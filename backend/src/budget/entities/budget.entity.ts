import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';

export interface ExpenseCategories {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  entertainment: number;
  healthcare: number;
  miscellaneous: number;
}

@Entity('budgets')
@Unique(['user', 'month', 'year'])
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyIncome: number;

  @Column({ type: 'json' })
  expenses: ExpenseCategories;

  @Column({ type: 'json' })
  actualExpenses: ExpenseCategories;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Virtual properties
  get totalBudgeted(): number {
    return Object.values(this.expenses).reduce((sum, amount) => sum + amount, 0);
  }

  get totalActual(): number {
    return Object.values(this.actualExpenses).reduce((sum, amount) => sum + amount, 0);
  }

  get availableForDebt(): number {
    return Number(this.monthlyIncome) - this.totalActual;
  }

  get budgetVariance(): number {
    return this.totalBudgeted - this.totalActual;
  }
}