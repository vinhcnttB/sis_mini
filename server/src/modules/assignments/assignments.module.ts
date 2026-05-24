import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from '../files/cloudinary.service';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        expiresIn: '30d',
      },
    }),
    NotificationModule,
  ],
  providers: [
    AssignmentsService,
    PrismaService,
    CloudinaryService,
    AuthService,
  ],
  controllers: [AssignmentsController],
})
export class AssignmentsModule {}
