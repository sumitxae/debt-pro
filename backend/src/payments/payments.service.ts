import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto & { 
    debtId: string; 
    userId: string; 
    principalAmount: number; 
    interestAmount: number; 
    remainingBalance: number;
  }): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      debt: { id: createPaymentDto.debtId },
      user: { id: createPaymentDto.userId },
      paymentDate: createPaymentDto.paymentDate || new Date(),
    });

    return this.paymentRepository.save(payment);
  }

  async findByUser(userId: string, limit?: number): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.debt', 'debt')
      .leftJoin('payment.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('payment.paymentDate', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return queryBuilder.getMany();
  }

  async findByDebt(debtId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { debt: { id: debtId } },
      relations: ['debt'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['debt', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getMonthlyPayments(userId: string, year: number, month: number): Promise<Payment[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.paymentRepository.find({
      where: {
        user: { id: userId },
        paymentDate: Between(startDate, endDate),
      },
      relations: ['debt'],
      order: { paymentDate: 'DESC' },
    });
  }

  async getPaymentStats(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.user', 'user')
      .leftJoinAndSelect('payment.debt', 'debt')
      .where('user.id = :userId', { userId })
      .andWhere('payment.paymentDate >= :startDate', { startDate })
      .orderBy('payment.paymentDate', 'ASC')
      .getMany();

    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalPrincipal = payments.reduce((sum, payment) => sum + Number(payment.principalAmount), 0);
    const totalInterest = payments.reduce((sum, payment) => sum + Number(payment.interestAmount), 0);

    // Group by month for trend analysis
    const monthlyStats = {};
    payments.forEach(payment => {
      const monthKey = `${payment.paymentDate.getFullYear()}-${String(payment.paymentDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          totalAmount: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          paymentCount: 0,
        };
      }
      monthlyStats[monthKey].totalAmount += Number(payment.amount);
      monthlyStats[monthKey].totalPrincipal += Number(payment.principalAmount);
      monthlyStats[monthKey].totalInterest += Number(payment.interestAmount);
      monthlyStats[monthKey].paymentCount += 1;
    });

    return {
      totalPayments: payments.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      averagePayment: payments.length > 0 ? Math.round((totalAmount / payments.length) * 100) / 100 : 0,
      principalToInterestRatio: totalInterest > 0 ? Math.round((totalPrincipal / totalInterest) * 100) / 100 : 0,
      monthlyBreakdown: Object.values(monthlyStats),
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const payment = await this.findById(id, userId);
    await this.paymentRepository.remove(payment);
  }
}