import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Payment } from '@/payments/entities/payment.entity';

export enum DebtType {
  CREDIT_CARD = 'credit_card',
  PERSONAL_LOAN = 'personal_loan',
  HOME_LOAN = 'home_loan',
  AUTO_LOAN = 'auto_loan',
  STUDENT_LOAN = 'student_loan',
  OTHER = 'other',
}

export enum DebtStatus {
  ACTIVE = 'active',
  PAID_OFF = 'paid_off',
  CLOSED = 'closed',
}

export enum PaymentInterval {
  MONTHLY = 'monthly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly',
}

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DebtType,
  })
  type: DebtType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  originalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  interestRate: number;

  @Column({
    type: 'enum',
    enum: PaymentInterval,
    default: PaymentInterval.MONTHLY,
  })
  paymentInterval: PaymentInterval;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minimumPayment: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({
    type: 'enum',
    enum: DebtStatus,
    default: DebtStatus.ACTIVE,
  })
  status: DebtStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.debts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Payment, payment => payment.debt)
  payments: Payment[];

  // Virtual properties
  get totalPaid(): number {
    return this.payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  }

  get paymentProgress(): number {
    if (Number(this.originalAmount) === 0) return 0;
    return ((Number(this.originalAmount) - Number(this.currentBalance)) / Number(this.originalAmount)) * 100;
  }

  // Helper method to get the next due date based on payment interval
  getNextDueDate(): Date {
    if (!this.dueDate) return null;
    
    const currentDueDate = new Date(this.dueDate);
    const nextDueDate = new Date(currentDueDate);
    
    switch (this.paymentInterval) {
      case PaymentInterval.MONTHLY:
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      case PaymentInterval.HALF_YEARLY:
        nextDueDate.setMonth(nextDueDate.getMonth() + 6);
        break;
      case PaymentInterval.YEARLY:
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        break;
    }
    
    return nextDueDate;
  }

  // Helper method to get interval description
  getIntervalDescription(): string {
    switch (this.paymentInterval) {
      case PaymentInterval.MONTHLY:
        return 'Monthly';
      case PaymentInterval.HALF_YEARLY:
        return 'Half Yearly';
      case PaymentInterval.YEARLY:
        return 'Yearly';
      default:
        return 'Unknown';
    }
  }
}