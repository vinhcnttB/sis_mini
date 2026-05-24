import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  InternalServerErrorException,
  BadRequestException,
  UseGuards,
  HttpException,
  HttpStatus,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/create-class.dto';
import { CurrentUser } from 'src/decorators/users.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateClassResponse,
  GetStudentClassResponse,
  GetStudentInClassResponse,
  GetTeacherClassResponse,
  InviteGroupStudentResponse,
  InviteStudentResponse,
} from './dto/response';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthService } from '../auth/auth.service';
import {
  MAIL_TEMPLATE_ID,
  ROLES,
  appendDataToExcelFile,
  createBufferFromExcelFile,
  readFileExcel,
} from 'src/utils';
import * as moment from 'moment';
import { SendgridService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { customAlphabet } from 'nanoid';
import { CreateGradeDto, UpdateGradeDto } from '../assignments/dto/body.dto';
import * as xlsx from 'xlsx';
import { CloudinaryService } from '../files/cloudinary.service';
import {
  filter,
  flatMap,
  includes,
  isEmpty,
  map,
  toNumber,
  uniqBy,
} from 'lodash';
import { NotificationService } from '../notification/notification.service';

@Controller('classes')
@ApiTags('Classes')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly classesService: ClassesService,
    private readonly authService: AuthService,
    private readonly mailService: SendgridService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CreateClassResponse })
  async create(
    @Body() createClassDto: CreateClassDto,
    @CurrentUser('id') teacherId: string,
  ) {
    const exClass = await this.classesService.findOne(createClassDto.name);
    const uniqueCode = customAlphabet(
      '1234567890abcdefghiklmnouwpqz',
      10,
    )(8).toUpperCase();
    if (exClass) {
      throw new BadRequestException({
        status: false,
        message: 'Lớp học đã tồn tại',
      });
    }
    const classCreated = await this.classesService.create({
      ...createClassDto,
      uniqueCode,
    });
    const isCreator = true;
    await this.classesService.addTeacherToClass(
      classCreated.id,
      teacherId,
      isCreator,
    );
    const classResponse = await this.classesService.findClassById(
      classCreated.id,
    );
    return {
      status: true,
      data: classResponse,
      message: 'Tạo lớp học thành công',
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: CreateClassResponse })
  async update(
    @Param('id') id: string,
    @Body() createClassDto: UpdateClassDto,
  ) {
    const exClass = await this.classesService.findClassById(id, false);
    if (!exClass) {
      throw new BadRequestException({
        status: false,
        message: 'Lớp học không tồn tại',
      });
    }
    const { maximumStudents: currentStudent } = exClass;
    if (currentStudent > createClassDto.maximumStudents) {
      throw new BadRequestException({
        status: false,
        message: 'Số lượng học sinh không được nhỏ hơn số lượng hiện tại',
      });
    }
    const classUpdated = await this.classesService.updateClass(
      id,
      createClassDto,
    );
    const classResponse = await this.classesService.findClassById(
      classUpdated.id,
      false,
    );
    return {
      status: true,
      data: classResponse,
      message: 'Cập nhật lớp học thành công',
    };
  }

  @Get('student')
  @ApiOkResponse({ type: GetStudentClassResponse })
  async findAll(@CurrentUser('id') userId: string) {
    try {
      const classes = await this.classesService.findAll(userId);

      return {
        status: true,
        data: classes,
        message: 'Lấy danh sách lớp học thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: false,
        message: 'Lỗi hệ thống',
      });
    }
  }

  @Get('teacher')
  @ApiOkResponse({ type: GetTeacherClassResponse })
  async getAllClassesOfTeacher(@CurrentUser('id') teacherId: string) {
    try {
      const classes =
        await this.classesService.getAllClassesOfTeacher(teacherId);
      return {
        status: true,
        data: classes,
        message: 'Lấy danh sách lớp học thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: false,
        message: 'Lỗi hệ thống',
      });
    }
  }

  @Get('admin')
  @ApiOkResponse({ type: GetTeacherClassResponse })
  async getAllClasses() {
    try {
      const classes = await this.classesService.getAllClasses();
      return {
        status: true,
        data: classes,
        message: 'Lấy danh sách lớp học thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: false,
        message: 'Lỗi hệ thống',
      });
    }
  }

  @Get(':id')
  @ApiOkResponse({ type: CreateClassResponse })
  async findOne(@Param('id') id: string) {
    const classResponse = await this.classesService.findClassById(id);
    if (!classResponse) {
      throw new BadRequestException({
        status: false,
        message: 'Lớp học không tồn tại',
      });
    }
    return {
      status: true,
      data: classResponse,
      message: 'Lấy thông tin lớp học thành công',
    };
  }

  @Get(':id/students')
  @ApiOkResponse({ type: GetStudentInClassResponse })
  async getStudentsOfClass(@Param('id') id: string) {
    try {
      const students = await this.classesService.getStudentsOfClass(id);
      return {
        status: true,
        data: students,
        message: 'Lấy danh sách học sinh thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: false,
        message: 'Lỗi hệ thống',
      });
    }
  }

  @Delete(':id/students/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Loại học sinh khỏi lớp' })
  async removeStudentFromClass(
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
    @CurrentUser('id') teacherId: string,
  ) {
    try {
      // Check if current user is a teacher of this class
      const isTeacher = await this.classesService.findStudentOrTeacherInClass(
        classId,
        teacherId,
        ROLES.TEACHER,
      );
      if (!isTeacher) {
        throw new BadRequestException({
          status: false,
          message: 'Bạn không có quyền thực hiện thao tác này',
        });
      }

      await this.classesService.removeStudentFromClass(classId, studentId);
      
      return {
        status: true,
        message: 'Đã loại học sinh khỏi lớp',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: false,
        message: error.response?.message || 'Lỗi hệ thống',
      });
    }
  }

  @Get(':id/invite/:email')
  @ApiOkResponse({ type: InviteStudentResponse })
  async inviteStudentToClass(
    @Param('email') email: string,
    @Param('id') id: string,
  ) {
    const user = await this.authService.findUserVerifyEmail(email);
    if (!user) {
      throw new BadRequestException({
        status: false,
        message: 'Email không tồn tại',
      });
    }
    const frontendUrl = process.env.FRONTEND_URL;
    const token = await this.authService.generateAccessToken({
      id: user.id,
      email: user.email,
      classId: id,
    });
    const dynamic_template_data = {
      link: `${frontendUrl}/invite?token=${token}`,
    };
    const msg = this.mailService.messageSignUpGenerate(
      [email as string],
      MAIL_TEMPLATE_ID.REGISTER as string,
      dynamic_template_data,
    );
    try {
      await this.mailService.send(msg);
    } catch (error) {
      console.log('Mock email sent (Sendgrid not configured). Link:', dynamic_template_data.link);
    }

    const exClass = await this.classesService.findClassById(id);
    const notiLength = await this.notificationService.readNotiLengthFromDB(user.id);
    const notiId = notiLength ? notiLength : 0;
    const payload = {
      id: notiId,
      title: 'Lời mời tham gia lớp học mới',
      content: `Bạn được mời tham gia lớp học <b>${exClass.name}</b>.<br/><a href="${frontendUrl}/invite?token=${token}" style="color: #2A85FF; font-weight: bold;">[Chấp nhận lời mời]</a>`,
      createdAt: new Date().toISOString(),
      isRead: false,
      type: 'class_invitation',
      classId: id,
      token: token,
      accepted: false,
    };
    try {
      await this.notificationService.saveNewNotiToUser({
        userId: user.id,
        currentNotiLength: notiLength || 0,
        newData: payload,
      });
    } catch (e) {
      console.log('Failed to save invitation notification to Firebase:', e);
    }

    return {
      status: true,
      message: 'Mời thành công',
      data: null,
    };
  }

  @Get('accept-invite/:token')
  async acceptInvite(@Param('token') token: string) {
    const jwtSercret = process.env.SECRET_KEY;
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: jwtSercret,
    });
    if (!decoded) {
      throw new HttpException(
        {
          message: 'Lỗi xác thực',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate expired token
    const isTokenExpired = Date.now() >= decoded.exp * 1000;
    if (isTokenExpired) {
      throw new HttpException(
        {
          message: 'Đường dẫn đã hết hạn. Vui lòng thử lại sau',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.authService.findUserVerifyByUserId(decoded.id);
    if (!user) {
      throw new BadRequestException({
        status: false,
        message: 'Tài khoản không tồn tại',
      });
    }
    const roleId = user.roleId;
    const exUser = await this.classesService.findStudentOrTeacherInClass(
      decoded.classId,
      user?.id,
      roleId,
    );
    if (exUser) {
      throw new BadRequestException({
        status: false,
        message: 'Bạn đã tham gia lớp học này',
      });
    }
    if (roleId === ROLES.STUDENT) {
      await this.classesService.inviteStudentToClass(decoded.classId, user?.id);
    } else {
      await this.classesService.inviteTeacherToClass(decoded.classId, user?.id);
    }

    const exClass = await this.classesService.findClassById(decoded.classId);

    // 1. Update student's invitation notification in Firebase
    try {
      const studentNotis = await this.notificationService.getNotifications(user.id);
      if (studentNotis) {
        const notiKeys = Object.keys(studentNotis);
        for (const key of notiKeys) {
          const noti = studentNotis[key];
          if (noti && noti.classId === decoded.classId && noti.type === 'class_invitation') {
            await this.notificationService.updateNotification(user.id, noti.id, {
              accepted: true,
              isRead: true,
              content: `Bạn đã tham gia lớp học <b>${exClass.name}</b>.`,
            });
            break;
          }
        }
      }
    } catch (e) {
      console.log('Error updating student notification in Firebase:', e);
    }

    // 2. Notify teachers of the class
    try {
      const teachers = await this.classesService.getTeachersOfClass(decoded.classId);
      const roleName = roleId === ROLES.STUDENT ? 'Sinh viên' : 'Giáo viên';
      for (const t of teachers) {
        const teacherId = t.teachers?.id;
        if (teacherId) {
          const notiLength = await this.notificationService.readNotiLengthFromDB(teacherId);
          const notiId = notiLength ? notiLength : 0;
          const payload = {
            id: notiId,
            title: 'Thành viên tham gia lớp học',
            content: `${roleName} <b>${user.firstName} ${user.lastName}</b> đã đồng ý tham gia lớp học <b>${exClass.name}</b>.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'class_invitation_accepted',
            classId: decoded.classId,
          };
          await this.notificationService.saveNewNotiToUser({
            userId: teacherId,
            currentNotiLength: notiLength || 0,
            newData: payload,
          });
        }
      }
    } catch (e) {
      console.log('Error sending notification to teachers in Firebase:', e);
    }

    return {
      status: true,
      message: 'Tham gia lớp thành công',
      data: null,
    };
  }

  @Get(':id/group-invite')
  @ApiOkResponse({ type: InviteGroupStudentResponse })
  async inviteGroupUserToClass(@Param('id') id: string) {
    const exInvitation = await this.classesService.findInvitationByClassId(id);
    const frontendUrl = process.env.FRONTEND_URL;
    if (exInvitation) {
      const expiredAt = exInvitation.expiredAt;
      if (moment().isAfter(expiredAt)) {
        await this.classesService.deleteInvitations(exInvitation.classId);
        const expiredAt = moment().add(30, 'days').toDate().toISOString();
        const invitationsLink =
          await this.classesService.inviteGroupUserToClass(id, expiredAt);

        const link = `${frontendUrl}/group-invite?invitation=${invitationsLink.id}`;
        return {
          status: true,
          message: 'Mời thành công',
          data: link,
        };
      }
      const link = `${frontendUrl}/group-invite?invitation=${exInvitation.id}`;
      return {
        status: true,
        message: 'Mời thành công',
        data: link,
      };
    }
    const expiredAt = moment().add(30, 'days').toDate().toISOString();
    const invitationsLink = await this.classesService.inviteGroupUserToClass(
      id,
      expiredAt,
    );
    const link = `${frontendUrl}/group-invite?invitation=${invitationsLink.id}`;
    return {
      status: true,
      message: 'Mời thành công',
      data: link,
    };
  }

  @Get('accept-group-invite/:invitationId/:userId')
  @ApiOkResponse({ type: InviteStudentResponse })
  async acceptGroupInvite(
    @Param('invitationId') invitationId: string,
    @Param('userId') userId: string,
  ) {
    const invitation =
      await this.classesService.findInvitationById(invitationId);
    if (!invitation) {
      throw new BadRequestException({
        status: false,
        message: 'Mã mời không tồn tại',
      });
    }
    const expiredAt = invitation.expiredAt;
    if (moment().isAfter(expiredAt)) {
      throw new BadRequestException({
        status: false,
        message: 'Mã mời đã hết hạn',
      });
    }
    const user = await this.authService.findUserVerifyByUserId(userId);
    if (!user) {
      throw new BadRequestException({
        status: false,
        message: 'Tài khoản không tồn tại',
      });
    }
    const roleId = user.roleId;
    const exUser = await this.classesService.findStudentOrTeacherInClass(
      invitation.classId,
      user?.id,
      roleId,
    );
    if (exUser) {
      throw new BadRequestException({
        status: false,
        message: 'Bạn đã tham gia lớp học này',
      });
    }
    if (roleId === ROLES.STUDENT) {
      await this.classesService.inviteStudentToClass(
        invitation.classId,
        user?.id,
      );
    } else {
      await this.classesService.inviteTeacherToClass(
        invitation.classId,
        user?.id,
      );
    }

    const exClass = await this.classesService.findClassById(invitation.classId);

    // 1. Update student's invitation notification in Firebase
    try {
      const studentNotis = await this.notificationService.getNotifications(user.id);
      if (studentNotis) {
        const notiKeys = Object.keys(studentNotis);
        for (const key of notiKeys) {
          const noti = studentNotis[key];
          if (noti && noti.classId === invitation.classId && noti.type === 'class_invitation') {
            await this.notificationService.updateNotification(user.id, noti.id, {
              accepted: true,
              isRead: true,
              content: `Bạn đã tham gia lớp học <b>${exClass.name}</b>.`,
            });
            break;
          }
        }
      }
    } catch (e) {
      console.log('Error updating student notification in Firebase:', e);
    }

    // 2. Notify teachers of the class
    try {
      const teachers = await this.classesService.getTeachersOfClass(invitation.classId);
      const roleName = roleId === ROLES.STUDENT ? 'Sinh viên' : 'Giáo viên';
      for (const t of teachers) {
        const teacherId = t.teachers?.id;
        if (teacherId) {
          const notiLength = await this.notificationService.readNotiLengthFromDB(teacherId);
          const notiId = notiLength ? notiLength : 0;
          const payload = {
            id: notiId,
            title: 'Thành viên tham gia lớp học',
            content: `${roleName} <b>${user.firstName} ${user.lastName}</b> đã đồng ý tham gia lớp học <b>${exClass.name}</b>.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'class_invitation_accepted',
            classId: invitation.classId,
          };
          await this.notificationService.saveNewNotiToUser({
            userId: teacherId,
            currentNotiLength: notiLength || 0,
            newData: payload,
          });
        }
      }
    } catch (e) {
      console.log('Error sending notification to teachers in Firebase:', e);
    }

    return {
      status: true,
      message: 'Tham gia lớp thành công',
      data: null,
    };
  }

  @Post(':id/grades')
  async createGrade(@Param('id') id: string, @Body() body: CreateGradeDto) {
    // delete old grade
    await this.classesService.deleteGrades(id);
    const grades = await this.classesService.createGrade(id, body);
    return {
      status: true,
      data: grades,
      message: 'Tạo bài tập thành công',
    };
  }

  @Get(':id/grades')
  async getGrades(@Param('id') id: string) {
    const grades = await this.classesService.getGrades(id);
    return {
      status: true,
      data: grades,
      message: 'Lấy danh sách bài tập thành công',
    };
  }

  @Put(':id/grades/:gradeId')
  async updateGrade(
    @Param('gradeId') gradeId: string,
    @Param('id') id: string,
    @Body() body: UpdateGradeDto,
  ) {
    const grades = await this.classesService.updateGrade(gradeId, body);
    const students = await this.classesService.getStudentsOfClass(id);
    const exClass = await this.classesService.findClassById(id);
    await Promise.all(
      map(students, async (student) => {
        const userId = student?.id;
        const notiLength =
          await this.notificationService.readNotiLengthFromDB(userId);
        const id = notiLength ? notiLength : 0;
        const payload = {
          content: `Giáo viên lóp ${exClass.name} vừa cập nhật điểm số bài tập`,
          createdAt: new Date().toISOString(),
          isRead: false,
          title: 'Bạn vừa được cập nhật điểm số bài tập',
          type: 'finish_grade_composition',
        };
        return this.notificationService.saveNewNotiToUser({
          userId,
          currentNotiLength: notiLength || 0,
          newData: {
            ...payload,
            id,
          },
        });
      }),
    );
    return {
      status: true,
      data: grades,
      message: 'Cập nhật bài tập thành công',
    };
  }

  @Get(':id/export-student-list')
  async exportStudentList(@Param('id') id: string) {
    const students = await this.classesService.getStudentsOfClass(id);
    const refactorStudents = students?.map((student) => {
      return {
        StudentId: student?.uniqueId || Math.floor(Math.random() * 1000000000),
        Fullname: `${student.firstName} ${student.lastName}`,
      };
    });
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(refactorStudents);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64Str = buffer.toString('base64');
    return {
      status: true,
      data: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Str}`,
      message: 'Lấy danh sách học sinh thành công',
    };
  }

  @Get(':id/export-grade-board')
  async exportGrade(@Param('id') id: string) {
    const grades = await this.classesService.getGrades(id);
    if (isEmpty(grades)) {
      return {
        status: false,
        message: 'Lớp học chưa có bài tập nào',
      };
    }
    let workbook = xlsx.utils.book_new();
    map(grades, (studentAssignment) => {
      const { assignments } = studentAssignment;
      if (isEmpty(assignments)) {
        return null;
      }
      const { studentAssignments } = assignments;
      const refactoredStudentsData = map(studentAssignments, (student) => {
        const { students } = student;
        return {
          'Full Name': students ? (students.firstName + ' ' + students.lastName) : 'N/A',
          'Student Id': students?.uniqueId || 'N/A',
          Grade: student.score,
        };
      });
      workbook = appendDataToExcelFile(
        refactoredStudentsData,
        workbook,
        studentAssignment.name,
      );
    });
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64Str = buffer.toString('base64');
    return {
      status: true,
      data: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Str}`,
      message: 'Tải file Grade thành công',
    };
  }

  @Get(':id/grade-board')
  async getGradeBoard(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const grades = await this.classesService.getGrades(id);
    const teachers = await this.classesService.getTeachersOfClass(id);
    const refactorTeachers = map(teachers, ({ teachers }) => teachers);
    const isStudent = !includes(map(refactorTeachers, 'id'), userId);
    const scores = map(grades, (studentAssignment) => {
      const { assignments, status } = studentAssignment;
      if (isEmpty(assignments)) {
        return {
          id: studentAssignment.id,
          name: studentAssignment.name,
          scores: [],
        };
      }
      const { studentAssignments } = assignments;
      const refactoredStudentsData = map(studentAssignments, (student) => {
        const { students } = student;
        if (!students) return null;
        const isViewedByStudent =
          status === 'COMPLETE' && isStudent && students.id === userId;
        return {
          fullName: students.firstName + ' ' + students.lastName,
          studentId: students?.uniqueId,
          Grade: !isStudent || isViewedByStudent ? student.score : null,
          userId: students.id,
        };
      }).filter(Boolean);
      return {
        id: studentAssignment.id,
        name: studentAssignment.name,
        scores: refactoredStudentsData,
      };
    });
    const refactorData = flatMap(
      map(scores, (score) => {
        const { scores } = score;
        const refactoredScores = map(scores, (studentScore) => {
          return {
            fullName: studentScore.fullName,
            studentId: studentScore.studentId,
            grade: studentScore.Grade,
            gradeId: score.id,
            gradeName: score.name,
            userId: studentScore.userId,
          };
        });
        return refactoredScores;
      }),
    );
    const students = uniqBy(refactorData, 'userId');
    const refactorStudentsScore = map(students, (student) => {
      const studentScores = filter(refactorData, { userId: student.userId });
      return {
        fullName: student.fullName,
        studentId: student.studentId,
        userId: student.userId,
        scores: map(studentScores, (score) => ({
          grade: score.grade,
          gradeId: score.gradeId,
          gradeName: score.gradeName,
        })),
      };
    });
    return {
      status: true,
      data: refactorStudentsScore,
      message: 'Lấy danh sách bảng điểm thành công',
    };
  }

  @Get('invite-by-class-code/:classCode')
  async inviteStudentByClassCode(
    @Param('classCode') classCode: string,
    @CurrentUser('id') userId: string,
  ) {
    const exClass = await this.classesService.findClassByCodeId(classCode);
    if (!exClass) {
      throw new BadRequestException({
        status: false,
        message: 'Mã lớp không tồn tại',
      });
    }
    const exUser = await this.classesService.findStudentOrTeacherInClass(
      exClass.id,
      userId,
      ROLES.STUDENT,
    );
    if (exUser) {
      throw new BadRequestException({
        status: false,
        message: 'Bạn đã tham gia lớp học này',
      });
    }
    await this.classesService.inviteStudentToClass(exClass.id, userId);

    const user = await this.authService.findUserVerifyByUserId(userId);

    // 1. Update student's invitation notification in Firebase
    try {
      const studentNotis = await this.notificationService.getNotifications(user.id);
      if (studentNotis) {
        const notiKeys = Object.keys(studentNotis);
        for (const key of notiKeys) {
          const noti = studentNotis[key];
          if (noti && noti.classId === exClass.id && noti.type === 'class_invitation') {
            await this.notificationService.updateNotification(user.id, noti.id, {
              accepted: true,
              isRead: true,
              content: `Bạn đã tham gia lớp học <b>${exClass.name}</b>.`,
            });
            break;
          }
        }
      }
    } catch (e) {
      console.log('Error updating student notification in Firebase:', e);
    }

    // 2. Notify teachers of the class
    try {
      const teachers = await this.classesService.getTeachersOfClass(exClass.id);
      for (const t of teachers) {
        const teacherId = t.teachers?.id;
        if (teacherId) {
          const notiLength = await this.notificationService.readNotiLengthFromDB(teacherId);
          const notiId = notiLength ? notiLength : 0;
          const payload = {
            id: notiId,
            title: 'Thành viên tham gia lớp học',
            content: `Sinh viên <b>${user.firstName} ${user.lastName}</b> đã đồng ý tham gia lớp học <b>${exClass.name}</b>.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'class_invitation_accepted',
            classId: exClass.id,
          };
          await this.notificationService.saveNewNotiToUser({
            userId: teacherId,
            currentNotiLength: notiLength || 0,
            newData: payload,
          });
        }
      }
    } catch (e) {
      console.log('Error sending notification to teachers in Firebase:', e);
    }

    return {
      status: true,
      message: 'Tham gia lớp thành công',
      data: null,
    };
  }

  @Get(':id/sample-student-template')
  async downloadSampleTemplate(@Param('id') id: string) {
    const sampleData = [
      {
        Email: 'student1@example.com',
        FirstName: 'John',
        LastName: 'Doe',
      },
      {
        Email: 'student2@example.com',
        FirstName: 'Jane',
        LastName: 'Smith',
      },
    ];
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64Str = buffer.toString('base64');
    return {
      status: true,
      data: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Str}`,
      message: 'Tải mẫu Excel thành công',
    };
  }

  @Post(':id/import-students')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 10,
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async importStudentsFromExcel(
    @Param('id') classId: string,
    @CurrentUser('id') teacherId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Check if teacher is in the class
    const teacher = await this.classesService.checkTeacherInClass(classId, teacherId);
    if (!teacher) {
      throw new BadRequestException({
        status: false,
        message: 'Bạn không có quyền thêm sinh viên vào lớp này',
      });
    }

    // Read Excel file
    const excelData = await readFileExcel(file.path);
    const exClass = await this.classesService.findClassById(classId);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const studentData of excelData as any[]) {
      try {
        const email = studentData.Email || studentData.email;
        const firstName = studentData.FirstName || studentData.firstName;
        const lastName = studentData.LastName || studentData.lastName;

        if (!email) {
          errors.push({
            data: studentData,
            message: 'Email không được để trống',
          });
          errorCount++;
          continue;
        }

        const user = await this.authService.findUserVerifyEmail(email);
        if (!user) {
          errors.push({
            email: email,
            message: 'Email không tồn tại trong hệ thống',
          });
          errorCount++;
          continue;
        }

        // Check if user is already in the class
        const existingStudent = await this.classesService.findStudentOrTeacherInClass(
          classId,
          user.id,
          ROLES.STUDENT,
        );
        if (existingStudent) {
          errors.push({
            email: email,
            message: 'Sinh viên đã tham gia lớp học này',
          });
          errorCount++;
          continue;
        }

        // Add student to class
        await this.classesService.inviteStudentToClass(classId, user.id);

        // Notify student
        try {
          const notiLength = await this.notificationService.readNotiLengthFromDB(user.id);
          const notiId = notiLength ? notiLength : 0;
          const payload = {
            id: notiId,
            title: 'Tham gia lớp học mới',
            content: `Bạn vừa được giáo viên thêm vào lớp học <b>${exClass.name}</b>.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'added_to_class',
            classId: classId,
          };
          await this.notificationService.saveNewNotiToUser({
            userId: user.id,
            currentNotiLength: notiLength || 0,
            newData: payload,
          });
        } catch (e) {
          console.log('Failed to save notification for Excel import', e);
        }

        successCount++;
      } catch (error) {
        errors.push({
          data: studentData,
          message: error.message || 'Lỗi khi thêm sinh viên',
        });
        errorCount++;
      }
    }

    return {
      status: true,
      message: `Nhập danh sách sinh viên thành công: ${successCount} thành công, ${errorCount} thất bại`,
      data: {
        successCount,
        errorCount,
        errors,
      },
    };
  }
}
