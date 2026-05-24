import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ChatWebsocketGateway } from '../socket/websocket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: ChatWebsocketGateway,
  ) {}

  public async readNotiLengthFromDB(userId: string) {
    const count = await this.prisma.notifications.count({
      where: { userId }
    });
    return count;
  }

  async saveNewNotiToUser({
    userId,
    newData,
  }: {
    userId: string;
    currentNotiLength?: number;
    newData: any;
  }) {
    const notification = await this.prisma.notifications.create({
      data: {
        userId,
        title: newData.title,
        content: newData.content,
        type: newData.type,
        classId: newData.classId,
        token: newData.token,
        accepted: newData.accepted || false,
        isRead: newData.isRead || false,
        createdAt: newData.createdAt ? new Date(newData.createdAt) : new Date(),
      }
    });

    // Emit real-time update
    this.websocketGateway.server.to(userId).emit('new_notification', notification);
    
    return notification;
  }

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    // To maintain compatibility with object-based format used in UI initially
    // or we can just return array and fix UI. Let's return array.
    return notifications;
  }

  async updateNotification(userId: string, notiId: string, data: any) {
    const notification = await this.prisma.notifications.updateMany({
      where: { 
        id: notiId,
        userId: userId 
      },
      data
    });
    return notification;
  }

  async markAllAsRead(userId: string) {
    const notification = await this.prisma.notifications.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return notification;
  }
}
