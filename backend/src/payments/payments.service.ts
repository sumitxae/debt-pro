import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Debt, DebtStatus } from '../debts/entities/debt.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
  ) {}

  async getAllPayments(userId: string, limit?: number) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.debt', 'debt')
      .where('debt.userId = :userId', { userId })
      .orderBy('payment.paymentDate', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async getPaymentStats(userId: string, months: number = 12) {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.debt', 'debt')
      .where('debt.userId = :userId', { userId })
      .andWhere('payment.paymentDate >= :startDate', {
        startDate: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
      })
      .getMany();

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPrincipal = payments.reduce((sum, payment) => sum + payment.principalAmount, 0);
    const totalInterest = payments.reduce((sum, payment) => sum + payment.interestAmount, 0);
    const averageMonthlyPayment = payments.length > 0 ? totalPaid / months : 0;

    return {
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      averageMonthlyPayment: Math.round(averageMonthlyPayment * 100) / 100,
      paymentCount: payments.length,
      lastPaymentDate: payments.length > 0 ? payments[0].paymentDate.toISOString() : null,
    };
  }

  async getMonthlyPayments(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.debt', 'debt')
      .where('debt.userId = :userId', { userId })
      .andWhere('payment.paymentDate >= :startDate', { startDate })
      .andWhere('payment.paymentDate <= :endDate', { endDate })
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();
  }

  async getPaymentById(userId: string, id: string) {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.debt', 'debt')
      .where('payment.id = :id', { id })
      .andWhere('debt.userId = :userId', { userId })
      .getOne();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async recordPayment(userId: string, debtId: string, createPaymentDto: CreatePaymentDto) {
    // Get debt to calculate interest and principal
    const debt = await this.debtRepository.findOne({
      where: { id: debtId, user: { id: userId } },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    // Calculate interest and principal portions
    const monthlyInterestRate = Number(debt.interestRate) / 100 / 12;
    const interestAmount = Number(debt.currentBalance) * monthlyInterestRate;
    const principalAmount = Math.max(0, createPaymentDto.amount - interestAmount);
    const remainingBalance = Math.max(0, Number(debt.currentBalance) - principalAmount);

    // Create payment record
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      debt: { id: debtId },
      interestAmount: Math.round(interestAmount * 100) / 100,
      principalAmount: Math.round(principalAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update debt balance
    debt.currentBalance = remainingBalance;
    if (remainingBalance <= 0) {
      debt.status = DebtStatus.PAID_OFF;
    }
    await this.debtRepository.save(debt);

    return savedPayment;
  }

  async deletePayment(userId: string, id: string) {
    const payment = await this.getPaymentById(userId, id);
    
    // Revert debt balance
    const debt = await this.debtRepository.findOne({
      where: { id: payment.debt.id },
    });

    if (debt) {
      debt.currentBalance += payment.principalAmount;
      debt.status = DebtStatus.ACTIVE;
      await this.debtRepository.save(debt);
    }

    await this.paymentRepository.remove(payment);
    return { message: 'Payment deleted successfully' };
  }
}