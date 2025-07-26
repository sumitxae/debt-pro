import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DebtsModule } from '@/debts/debts.module';
import { PaymentsModule } from '@/payments/payments.module';
import { BudgetModule } from '@/budget/budget.module';

@Module({
  imports: [DebtsModule, PaymentsModule, BudgetModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}