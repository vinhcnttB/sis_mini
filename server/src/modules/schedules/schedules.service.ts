import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { classId, dayOfWeek, startTime, endTime, room } = createScheduleDto;
    
    // Kiểm tra lớp học tồn tại
    const exClass = await this.prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!exClass) {
      throw new NotFoundException({
        status: false,
        message: 'Lớp học không tồn tại',
      });
    }

    return this.prisma.schedules.create({
      data: {
        classId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      },
    });
  }

  async findByClassId(classId: string) {
    return this.prisma.schedules.findMany({
      where: { classId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException({
        status: false,
        message: 'Lịch học không tồn tại',
      });
    }

    return this.prisma.schedules.update({
      where: { id },
      data: updateScheduleDto,
    });
  }

  async remove(id: string) {
    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException({
        status: false,
        message: 'Lịch học không tồn tại',
      });
    }

    await this.prisma.schedules.delete({
      where: { id },
    });

    return {
      status: true,
      message: 'Xóa lịch học thành công',
    };
  }
}
