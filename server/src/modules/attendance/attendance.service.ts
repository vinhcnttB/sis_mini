import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SaveAttendanceDto, OpenAttendanceDto, CheckInAttendanceDto } from './dto/attendance.dto';
import * as moment from 'moment';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async saveAttendance(dto: SaveAttendanceDto) {
    const { classId, date, details } = dto;

    // Kiểm tra lớp học
    const exClass = await this.prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!exClass) {
      throw new NotFoundException({
        status: false,
        message: 'Lớp học không tồn tại',
      });
    }

    // Thiết lập ngày điểm danh về dạng bắt đầu của ngày (00:00:00) theo UTC để đồng bộ
    const targetDate = moment.utc(date, 'YYYY-MM-DD').startOf('day').toDate();

    return this.prisma.$transaction(async (tx) => {
      // Tìm phiên điểm danh hiện tại trong ngày của lớp
      let attendanceSession = await tx.attendance.findFirst({
        where: {
          classId,
          date: targetDate,
        },
      });

      if (!attendanceSession) {
        // Tạo phiên mới
        attendanceSession = await tx.attendance.create({
          data: {
            classId,
            date: targetDate,
          },
        });
      } else {
        // Xóa chi tiết điểm danh cũ của phiên này
        await tx.attendanceDetails.deleteMany({
          where: {
            attendanceId: attendanceSession.id,
          },
        });
      }

      // Tạo các chi tiết điểm danh mới
      const createDetails = details.map((detail) => ({
        attendanceId: attendanceSession.id,
        studentId: detail.studentId,
        status: detail.status,
        remark: detail.remark || '',
      }));

      await tx.attendanceDetails.createMany({
        data: createDetails,
      });

      return attendanceSession;
    });
  }

  async getAttendanceSessions(classId: string) {
    const sessions = await this.prisma.attendance.findMany({
      where: { classId },
      include: {
        attendanceDetails: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Tính toán số lượng thống kê cho mỗi phiên
    return sessions.map((session) => {
      const counts = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      };

      session.attendanceDetails.forEach((detail) => {
        if (detail.status === 'PRESENT') counts.present++;
        else if (detail.status === 'ABSENT') counts.absent++;
        else if (detail.status === 'LATE') counts.late++;
        else if (detail.status === 'EXCUSED') counts.excused++;
      });

      return {
        id: session.id,
        date: session.date,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        stats: counts,
        total: session.attendanceDetails.length,
      };
    });
  }

  async getAttendanceDetail(attendanceId: string) {
    const session = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });
    if (!session) {
      throw new NotFoundException({
        status: false,
        message: 'Phiên điểm danh không tồn tại',
      });
    }

    const details = await this.prisma.attendanceDetails.findMany({
      where: { attendanceId },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            uniqueId: true,
          },
        },
      },
      orderBy: {
        students: {
          lastName: 'asc',
        },
      },
    });

    return {
      session,
      details: details.map((d) => ({
        id: d.id,
        studentId: d.studentId,
        status: d.status,
        remark: d.remark,
        studentName: d.students ? `${d.students.firstName} ${d.students.lastName}` : '',
        studentEmail: d.students?.email || '',
        studentUniqueId: d.students?.uniqueId || '',
      })),
    };
  }

  async getStudentAttendance(classId: string, studentId: string) {
    const details = await this.prisma.attendanceDetails.findMany({
      where: {
        studentId,
        attendance: {
          classId,
        },
      },
      include: {
        attendance: true,
      },
      orderBy: {
        attendance: {
          date: 'desc',
        },
      },
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: details.length,
    };

    const history = details.map((d) => {
      if (d.status === 'PRESENT') stats.present++;
      else if (d.status === 'ABSENT') stats.absent++;
      else if (d.status === 'LATE') stats.late++;
      else if (d.status === 'EXCUSED') stats.excused++;

      return {
        id: d.id,
        date: d.attendance.date,
        status: d.status,
        remark: d.remark,
      };
    });

    return {
      stats,
      history,
    };
  }

  async openAttendance(dto: OpenAttendanceDto) {
    const { classId, date } = dto;

    const exClass = await this.prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!exClass) {
      throw new NotFoundException({
        status: false,
        message: 'Lớp học không tồn tại',
      });
    }

    const dateToUse = date ? date : moment().format('YYYY-MM-DD');
    const targetDate = moment.utc(dateToUse, 'YYYY-MM-DD').startOf('day').toDate();

    // Sinh mã ngẫu nhiên 4 chữ số
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Tìm phiên điểm danh hiện tại của lớp trong ngày này
    let attendanceSession = await this.prisma.attendance.findFirst({
      where: {
        classId,
        date: targetDate,
      },
    });

    if (!attendanceSession) {
      attendanceSession = await this.prisma.attendance.create({
        data: {
          classId,
          date: targetDate,
          isOpen: true,
          code: randomCode,
        },
      });
    } else {
      attendanceSession = await this.prisma.attendance.update({
        where: { id: attendanceSession.id },
        data: {
          isOpen: true,
          code: randomCode,
        },
      });
    }

    return attendanceSession;
  }

  async closeAttendance(sessionId: string) {
    const session = await this.prisma.attendance.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException({
        status: false,
        message: 'Phiên điểm danh không tồn tại',
      });
    }

    return this.prisma.attendance.update({
      where: { id: sessionId },
      data: {
        isOpen: false,
        code: null,
      },
    });
  }

  async getActiveSession(classId: string) {
    return this.prisma.attendance.findFirst({
      where: {
        classId,
        isOpen: true,
      },
    });
  }

  async studentCheckIn(studentId: string, dto: CheckInAttendanceDto) {
    const { classId, code } = dto;

    // Tìm phiên điểm danh đang mở có mã khớp
    const session = await this.prisma.attendance.findFirst({
      where: {
        classId,
        isOpen: true,
        code,
      },
    });

    if (!session) {
      throw new BadRequestException({
        status: false,
        message: 'Mã điểm danh không đúng hoặc phiên điểm danh đã đóng',
      });
    }

    // Kiểm tra xem sinh viên có trong lớp học này không
    const isEnrolled = await this.prisma.classStudents.findFirst({
      where: {
        classId,
        studentId,
      },
    });
    if (!isEnrolled) {
      throw new BadRequestException({
        status: false,
        message: 'Bạn không phải học sinh của lớp học này',
      });
    }

    // Kiểm tra xem đã có bản ghi chi tiết điểm danh chưa
    const existingDetail = await this.prisma.attendanceDetails.findFirst({
      where: {
        attendanceId: session.id,
        studentId,
      },
    });

    if (existingDetail) {
      // Nếu đã có bản ghi, cập nhật trạng thái thành PRESENT
      return this.prisma.attendanceDetails.update({
        where: { id: existingDetail.id },
        data: {
          status: 'PRESENT',
          remark: 'Sinh viên tự check-in (cập nhật)',
        },
      });
    } else {
      // Tạo mới bản ghi
      return this.prisma.attendanceDetails.create({
        data: {
          attendanceId: session.id,
          studentId,
          status: 'PRESENT',
          remark: 'Sinh viên tự check-in',
        },
      });
    }
  }
}
