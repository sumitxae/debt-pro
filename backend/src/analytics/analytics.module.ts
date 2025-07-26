import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Debt } from '@/debts/entities/debt.entity';
import { Payment } from '@/payments/entities/payment.entity';
import { Budget } from '@/budget/entities/budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Debt, Payment, Budget])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}