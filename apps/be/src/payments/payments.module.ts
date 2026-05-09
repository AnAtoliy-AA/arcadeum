import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ConfigModule } from '@nestjs/config';
import { PaymentNote, PaymentNoteSchema } from './schemas/payment-note.schema';
import { PaymentNotesService } from './payment-notes.service';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminPaymentNotesController } from './admin-payment-notes.controller';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: PaymentNote.name, schema: PaymentNoteSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PaymentsController, AdminPaymentNotesController],
  providers: [PaymentsService, PaymentNotesService, RolesGuard],
  exports: [PaymentsService, PaymentNotesService],
})
export class PaymentsModule {}
