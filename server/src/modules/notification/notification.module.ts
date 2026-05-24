import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { WebSocketModule } from '../socket/websocket.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [WebSocketModule],
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}
