import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { SaveAttendanceDto, OpenAttendanceDto, CheckInAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLES } from 'src/utils';
import { CurrentUser } from 'src/decorators/users.decorator';

@Controller('attendance')
@ApiTags('Attendance')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ROLES.TEACHER, ROLES.ADMIN)
  async saveAttendance(@Body() saveAttendanceDto: SaveAttendanceDto) {
    const data = await this.attendanceService.saveAttendance(saveAttendanceDto);
    return {
      status: true,
      message: 'Lưu điểm danh thành công',
      data,
    };
  }

  @Get('class/:classId')
  @UseGuards(RolesGuard)
  @Roles(ROLES.TEACHER, ROLES.ADMIN)
  async getAttendanceSessions(@Param('classId') classId: string) {
    const data = await this.attendanceService.getAttendanceSessions(classId);
    return {
      status: true,
      data,
    };
  }

  @Get('class/:classId/student')
  async getStudentAttendance(
    @Param('classId') classId: string,
    @CurrentUser('id') studentId: string,
  ) {
    const data = await this.attendanceService.getStudentAttendance(classId, studentId);
    return {
      status: true,
      data,
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.TEACHER, ROLES.ADMIN)
  async getAttendanceDetail(@Param('id') id: string) {
    const data = await this.attendanceService.getAttendanceDetail(id);
    return {
      status: true,
      data,
    };
  }

  @Post('open')
  @UseGuards(RolesGuard)
  @Roles(ROLES.TEACHER, ROLES.ADMIN)
  async openAttendance(@Body() openDto: OpenAttendanceDto) {
    const data = await this.attendanceService.openAttendance(openDto);
    return {
      status: true,
      message: 'Mở điểm danh tự động thành công',
      data,
    };
  }

  @Post(':id/close')
  @UseGuards(RolesGuard)
  @Roles(ROLES.TEACHER, ROLES.ADMIN)
  async closeAttendance(@Param('id') id: string) {
    const data = await this.attendanceService.closeAttendance(id);
    return {
      status: true,
      message: 'Đóng điểm danh tự động thành công',
      data,
    };
  }

  @Get('class/:classId/active')
  async getActiveSession(
    @Param('classId') classId: string,
    @CurrentUser('roleId') roleId: string,
  ) {
    const session = await this.attendanceService.getActiveSession(classId);
    if (!session) {
      return {
        status: true,
        data: null,
      };
    }
    // Nếu là sinh viên, ẩn mã code điểm danh để bảo mật
    if (roleId === ROLES.STUDENT) {
      const { code, ...safeSession } = session;
      return {
        status: true,
        data: safeSession,
      };
    }
    return {
      status: true,
      data: session,
    };
  }

  @Post('check-in')
  async studentCheckIn(
    @CurrentUser('id') studentId: string,
    @Body() checkInDto: CheckInAttendanceDto,
  ) {
    const data = await this.attendanceService.studentCheckIn(studentId, checkInDto);
    return {
      status: true,
      message: 'Sinh viên check-in điểm danh thành công',
      data,
    };
  }
}
