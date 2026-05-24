import { Controller, Post, Get, Put, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/decorators/users.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

@Controller('notification')
@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@CurrentUser('id') userId: string) {
    const notifications = await this.notificationService.getNotifications(userId);
    return {
      status: true,
      data: notifications,
    };
  }

  @Put('read-all')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return {
      status: true,
      message: 'Đã đánh dấu tất cả là đã đọc',
    };
  }

  @Put(':id/read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notiId: string,
  ) {
    await this.notificationService.updateNotification(userId, notiId, {
      isRead: true,
    });
    return {
      status: true,
      message: 'Đã đánh dấu đã đọc',
    };
  }
}
