import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtsController } from './debts.controller';
import { DebtsService } from './debts.service';
import { Debt } from './entities/debt.entity';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debt]),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService],
})
export class DebtsModule {}