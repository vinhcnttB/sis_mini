import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import {
  CreateAssignmentDTO,
  CreateConversationDto,
  MarkScoreStudentDto,
  RequestedGradeViewDto,
  StudentAssigmentDto,
  UpdateRequestedGradeViewDto,
} from './dto/body.dto';
import {
  ASSIGNMENT_STATUS,
  REQUESTED_REVIEW_STATUS,
  ROLES,
  createBufferFromExcelFile,
  readFileExcel,
} from 'src/utils';
import { CloudinaryService } from '../files/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from '../auth/auth.service';
import { map, toString } from 'lodash';
import { Prisma } from '@prisma/client';
import { CurrentUser } from 'src/decorators/users.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { NotificationService } from '../notification/notification.service';
import * as moment from 'moment';

@Controller('assignments')
@ApiTags('Assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get(':id')
  async getAssignment(@Param('id') id: string, @CurrentUser() user: any) {
    const assignment = await this.assignmentsService.getAssignment(id);
    if (!assignment) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy bài tập',
        },
        404,
      );
    }
    const { id: userId, roleId } = user;
    if (roleId === ROLES.TEACHER) {
      return {
        status: true,
        data: assignment,
        message: 'Lấy bài tập thành công',
      };
    }
    const { studentAssignments, ...rest } = assignment;
    const studentAssignment = studentAssignments.find(
      (studentAssignment) => studentAssignment.studentId === userId,
    );

    return {
      status: true,
      data: {
        ...rest,
        studentAssignments: [studentAssignment],
      },
      message: 'Lấy bài tập thành công',
    };
  }

  @Post()
  async createAssignment(
    @Body() body: CreateAssignmentDTO,
    @CurrentUser('id') teacherId: string,
  ) {
    const assignments = await this.assignmentsService.createAssignment({
      ...body,
      teacherId,
    });
    return {
      status: true,
      data: assignments,
      message: 'Tạo bài tập thành công',
    };
  }

  @Put(':id')
  async updateAssignment(
    @Body() body: CreateAssignmentDTO,
    @Param('id') id: string,
  ) {
    const assignments = await this.assignmentsService.updateAssignment(
      id,
      body,
    );
    return {
      status: true,
      data: assignments,
      message: 'Cập nhật bài tập thành công',
    };
  }

  @Get(':classId/all')
  async getAllAssignments(@Param('classId') classId: string) {
    const assignments =
      await this.assignmentsService.getAllAssignments(classId);
    return {
      status: true,
      data: assignments,
      message: 'Lấy danh sách bài tập thành công',
    };
  }

  @Get(':assignmentId/download-score')
  async downloadScoreForAssignment(@Param('assignmentId') id: string) {
    const grade = await this.assignmentsService.getAssignment(id);
    if (!grade) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy bài tập',
        },
        404,
      );
    }
    const { studentAssignments } = grade;
    const refactoredData = map(studentAssignments, (studentAssignment) => {
      const { students } = studentAssignment;
      return {
        'Student Id': students?.uniqueId || 'N/A',
        'Full Name': students ? (students.firstName + ' ' + students.lastName) : 'N/A',
        Grade: studentAssignment.score,
      };
    });
    const buffer = createBufferFromExcelFile(refactoredData, 'Grade');
    const uploadedFile = await this.cloudinaryService.uploadFile({
      buffer,
      filename: `Grade_${new Date().toISOString()}.xlsx`,
    });
    return {
      status: true,
      data: uploadedFile.url,
      message: 'Tải file Grade thành công',
    };
  }

  @Post(':assignmentId/student-assignment')
  async createStudentAssignment(
    @Body() body: StudentAssigmentDto,
    @Param('assignmentId') id: string,
    @CurrentUser('id') studentId: string,
  ) {
    const assignment = await this.assignmentsService.getAssignment(id);
    if (!assignment) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy bài tập',
        },
        404,
      );
    }
    const status =
      !assignment.dueDate || moment().isBefore(assignment.dueDate)
        ? ASSIGNMENT_STATUS.SUBMITTED
        : ASSIGNMENT_STATUS.LATE;
    const { metadata, description } = body;
    const studentAssignment =
      await this.assignmentsService.createStudentAssignment({
        studentId,
        assignmentId: id,
        metadata,
        status,
        description,
      });
    return {
      status: true,
      data: studentAssignment,
      message: 'Tải file Grade thành công',
    };
  }

  @Post(':assignmentId/mark-score')
  async markScoreForAssignment(
    @Param('assignmentId') id: string,
    @Body() body: MarkScoreStudentDto,
  ) {
    const { scores } = body;
    const refactoredScores = map(scores, (score) => ({
      ...score,
      assignmentId: id,
      status: ASSIGNMENT_STATUS.GRADED,
    }));
    const assignments =
      await this.assignmentsService.markScoreForAssignment(refactoredScores);
    return {
      status: true,
      data: assignments,
      message: 'Chấm điểm thành công',
    };
  }

  @Post(':id/mark-score-excel')
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
  async markScoreForAssignmentExcel(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const excelData = await readFileExcel(file.path);
    const students = await Promise.all(
      excelData.map(async (data: any) => {
        const { StudentId } = data;
        if (!StudentId) return null;
        const student = await this.authService.getUserByUniqueId(
          toString(StudentId),
        );
        if (!student) return null;
        return {
          studentId: student.id,
          score: data.Grade !== undefined ? Number(data.Grade) : null,
          assignmentId: id,
          status: ASSIGNMENT_STATUS.GRADED,
        };
      }),
    );
    const refactoredStudents = students.filter(Boolean);
    const assignments =
      await this.assignmentsService.markScoreForAssignment(refactoredStudents);
    return {
      status: true,
      data: assignments,
      message: 'Chấm điểm thành công',
    };
  }

  @Get(':assignmentId/requested-grade-view')
  async getRequestedGradeView(@Param('assignmentId') id: string) {
    const requestedReviews =
      await this.assignmentsService.getRequestedGradeView(id);
    const refactoredData = map(requestedReviews, (studentAssignment) => {
      const { students } = studentAssignment;
      return {
        studentId: students?.id,
        firstName: students?.firstName,
        lastName: students?.lastName,
        uniqueId: students?.uniqueId,
        expectedScore: studentAssignment.expectedScore,
        comment: studentAssignment.comment,
        status: studentAssignment.status,
        studentRequestedReviewId: studentAssignment.id,
        studentAssignmentId: studentAssignment?.studentAssignmentId,
      };
    });

    return {
      status: true,
      data: refactoredData,
      message: 'Lấy danh sách phúc khảo thành công',
    };
  }

  @Post(':assignmentId/requested-grade-view')
  async requestedGradeView(
    @Param('assignmentId') id: string,
    @Body() body: RequestedGradeViewDto,
    @CurrentUser() student: any,
  ) {
    const assignment = await this.assignmentsService.getAssignment(id);
    if (!assignment) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy bài tập',
        },
        404,
      );
    }
    const { teacherId } = assignment;
    const { expectedScore, studentAssignmentId, comment } = body;
    const inputData: Prisma.studentRequestedReviewsUncheckedCreateInput = {
      assignmentId: id,
      studentId: student.id,
      expectedScore,
      comment,
      status: REQUESTED_REVIEW_STATUS.OPENED,
      studentAssignmentId,
    };
    const requestedGradeView =
      await this.assignmentsService.createRequestedGradeView(inputData);
    // UPDATE STATUS OF STUDENT ASSIGNMENT
    await this.assignmentsService.updateStudentAssignment(
      studentAssignmentId,
      {
        status: ASSIGNMENT_STATUS.REQUESTED_REVIEW,
      },
    );
    // CREATE NOTIFICATION FOR TEACHER
    const notiLength =
      await this.notificationService.readNotiLengthFromDB(teacherId);
    const payload = {
      content: `Sinh viên ${
        student?.lastName + ' ' + student?.firstName
      } vừa tạo một phúc khảo cho bài tập ${assignment.name}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      title: 'Bạn vừa nhận được thông báo trong đoạn hội thoại',
      type: 'review',
    };
    await this.notificationService.saveNewNotiToUser({
      userId: teacherId,
      currentNotiLength: notiLength || 0,
      newData: {
        ...payload,
        id: notiLength ? notiLength : 0,
      },
    });
    return {
      status: true,
      data: requestedGradeView,
      message: 'Tải file Grade thành công',
    };
  }

  @Put('requested-grade-view/:studentRequestedReviewId')
  async updateRequestedGradeView(
    @Param('studentRequestedReviewId') studentRequestedReviewId: string,
    @Body() body: UpdateRequestedGradeViewDto,
    @CurrentUser() teacher: any,
  ) {
    const { actualScore, status, studentAssignmentId } = body;
    const prepareData: Prisma.studentRequestedReviewsUncheckedUpdateInput = {
      actualScore,
      status,
    };
    const studentAssignment =
      await this.assignmentsService.getStudentAssignment(studentAssignmentId);
    if (!studentAssignment) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy bài tập của học sinh',
        },
        404,
      );
    }
    const requestedGradeView =
      await this.assignmentsService.updateRequestedGradeView(
        studentRequestedReviewId,
        prepareData,
      );
    // update status of student assignment
    await this.assignmentsService.updateStudentAssignment(
      studentAssignmentId,
      {
        status:
          status === 'ACCEPT'
            ? ASSIGNMENT_STATUS.ACCEPT_REQUESTED_REVIEW
            : ASSIGNMENT_STATUS.DENIED_REQUESTED_REVIEW,
        score: actualScore,
      },
    );
    // CREATE NOTIFICATION FOR STUDENT
    const { students, assignments } = studentAssignment;
    const userId = students.id;
    const notiLength =
      await this.notificationService.readNotiLengthFromDB(userId);
    const id = notiLength ? notiLength : 0;
    const payload = {
      content: `Giáo viên ${
        teacher?.firstName + ' ' + teacher?.lastName
      } vừa phản hồi phúc khảo bài tập ${assignments?.name}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      title: 'Bạn vừa nhận được thông báo trong đoạn hội thoại',
      type: 'review',
    };
    await this.notificationService.saveNewNotiToUser({
      userId,
      currentNotiLength: notiLength || 0,
      newData: {
        ...payload,
        id,
      },
    });
    return {
      status: true,
      data: requestedGradeView,
      message: 'Tải file Grade thành công',
    };
  }

  @Post(
    ':assignmentId/requested-grade-view/:studentRequestedReviewId/conversation',
  )
  async createConversation(
    @Param('studentRequestedReviewId') studentRequestedReviewId: string,
    @Body() body: CreateConversationDto,
    @CurrentUser('id') userId: string,
    @Param('assignmentId') id: string,
  ) {
    const { message } = body;
    const assignment = await this.assignmentsService.getAssignment(id);
    if (!assignment) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy bài tập',
        },
        404,
      );
    }
    const requestedGradeViewDetail =
      await this.assignmentsService.getRequestGradeViewDetail(
        studentRequestedReviewId,
      );
    if (!requestedGradeViewDetail) {
      throw new HttpException(
        {
          status: false,
          message: 'Không tìm thấy phúc khảo',
        },
        404,
      );
    }
    const { students } = requestedGradeViewDetail;
    const { teacher } = assignment;
    if (students.id === userId) {
      const userId = teacher.id;
      const notiLength =
        await this.notificationService.readNotiLengthFromDB(userId);
      const id = notiLength ? notiLength : 0;
      const payload = {
        content: `Sinh viên ${
          students?.lastName + ' ' + students?.firstName
        } vừa phản hồi trong cuộc hội thoại phúc khảo bài tập ${
          assignment.name
        }`,
        createdAt: new Date().toISOString(),
        isRead: false,
        title: 'Bạn vừa nhận được thông báo trong đoạn hội thoại',
        type: 'review',
      };
      await this.notificationService.saveNewNotiToUser({
        userId,
        currentNotiLength: notiLength || 0,
        newData: {
          ...payload,
          id,
        },
      });
    } else {
      const userId = students.id;
      const notiLength =
        await this.notificationService.readNotiLengthFromDB(userId);
      const id = notiLength ? notiLength + 1 : 0;
      const payload = {
        content: `Giáo viên ${
          teacher?.lastName + ' ' + teacher?.firstName
        } vừa phản hồi trong cuộc hội thoại phúc khảo bài tập ${
          assignment.name
        }`,
        createdAt: new Date().toISOString(),
        isRead: false,
        title: 'Bạn vừa nhận được thông báo trong đoạn hội thoại',
        type: 'review',
      };
      await this.notificationService.saveNewNotiToUser({
        userId,
        currentNotiLength: notiLength || 0,
        newData: {
          ...payload,
          id,
        },
      });
    }
    const requestedGradeView = await this.assignmentsService.createConversation(
      studentRequestedReviewId,
      {
        message,
        userId,
      },
    );
    return {
      status: true,
      data: requestedGradeView,
      message: 'Tải file Grade thành công',
    };
  }
  @Get('requested-grade-view/:studentRequestedReviewId/conversation')
  async getConversation(
    @Param('studentRequestedReviewId') studentRequestedReviewId: string,
  ) {
    const requestedGradeView = await this.assignmentsService.getConversation(
      studentRequestedReviewId,
    );
    return {
      status: true,
      data: map(requestedGradeView, ({ users, ...conversation }) => ({
        ...conversation,
        user: users?.firstName + ' ' + users?.lastName,
      })),
      message: 'Tải file Grade thành công',
    };
  }
}
