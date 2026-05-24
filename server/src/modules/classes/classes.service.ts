import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { map } from 'lodash';
import { ROLES } from 'src/utils';
import { CreateGradeDto } from '../assignments/dto/body.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly prismaService: PrismaService,
  ) {}

  async getAllClasses() {
    const exClasses = await this.prismaService.classes.findMany({
      include: {
        classTeachers: {
          select: {
            teachers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    return map(exClasses, (exClass) => {
      const teachers = map(exClass.classTeachers, 'teachers');
      return {
        ...exClass,
        teachers,
        classTeachers: undefined,
      };
    });
  }

  async create(createClassDto) {
    return this.prismaService.classes.create({
      data: createClassDto,
    });
  }

  async checkTeacherInClass(classId: string, teacherId: string) {
    return this.prismaService.classTeachers.findFirst({
      where: {
        classId,
        teacherId,
      },
    });
  }

  async addTeacherToClass(
    classId: string,
    teacherId: string,
    isCreator: boolean = false,
  ) {
    return this.prismaService.classTeachers.create({
      data: {
        classId,
        teacherId,
        isCreator,
      },
    });
  }

  async findAll(userId: string) {
    const exClasses = await this.prismaService.classes.findMany({
      where: {
        classStudents: {
          some: {
            studentId: userId,
            isDisabled: false,
          },
        },
      },
      include: {
        classTeachers: {
          select: {
            teachers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    return map(exClasses, (exClass) => {
      const teachers = map(exClass.classTeachers, 'teachers');
      return {
        ...exClass,
        teachers,
        classTeachers: undefined,
      };
    });
  }

  async findOne(name: string) {
    return this.prismaService.classes.findFirst({
      where: {
        name: name,
        isDisabled: false,
      },
    });
  }
  async findClassById(id: string, notTakeAll: boolean = true) {
    const exClass = await this.prismaService.classes.findUnique({
      where: {
        id: id,
        ...(notTakeAll ? { isDisabled: false } : {}),
      },
      include: {
        classStudents: {
          select: {
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        classTeachers: {
          select: {
            teachers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    if (!exClass) return null;
    const students = map(exClass.classStudents, 'students').filter(Boolean);
    const teachers = map(exClass.classTeachers, 'teachers').filter(Boolean);
    
    console.log(`[DEBUG] findClassById for classId=${id}`);
    console.log(`[DEBUG] classStudents count:`, exClass.classStudents?.length);
    console.log(`[DEBUG] mapped students count:`, students.length);
    if (exClass.classStudents?.length > 0 && students.length === 0) {
      console.log(`[DEBUG] classStudents data:`, JSON.stringify(exClass.classStudents));
    }

    return {
      ...exClass,
      students,
      teachers,
      classStudents: undefined,
      classTeachers: undefined,
    };
  }

  async updateClass(id: string, updateClassDto) {
    return this.prismaService.classes.update({
      where: {
        id,
      },
      data: updateClassDto,
    });
  }
  async getAllClassesOfTeacher(teacherId: string) {
    const exClasses = await this.prismaService.classes.findMany({
      where: {
        classTeachers: {
          some: {
            teacherId,
            isDisabled: false,
          },
        },
      },
      include: {
        classTeachers: {
          select: {
            teachers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,

                email: true,
              },
            },
          },
        },
        classStudents: {
          select: {
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    return map(exClasses, (exClass) => {
      const teachers = map(exClass.classTeachers, 'teachers').filter(Boolean);
      const students = map(exClass.classStudents, 'students').filter(Boolean);
      return {
        ...exClass,
        teachers,
        students,
        classTeachers: undefined,
        classStudents: undefined,
      };
    });
  }

  async getStudentsOfClass(classId: string) {
    const students = await this.prismaService.classStudents.findMany({
      where: {
        classId,
      },
      include: {
        students: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            uniqueId: true,
          },
          where: {
            isDisabled: false,
            emailVerified: true,
          },
        },
      },
    });
    return map(students, 'students').filter(Boolean);
  }

  async inviteStudentToClass(classId: string, studentId: string) {
    return this.prismaService.classStudents.create({
      data: {
        classId,
        studentId,
      },
    });
  }

  async removeStudentFromClass(classId: string, studentId: string) {
    return this.prismaService.classStudents.deleteMany({
      where: {
        classId,
        studentId,
      },
    });
  }

  async inviteTeacherToClass(classId: string, teacherId: string) {
    return this.prismaService.classTeachers.create({
      data: {
        classId,
        teacherId,
      },
    });
  }

  async findClassByCodeId(uniqueCode: string) {
    return this.prismaService.classes.findUnique({
      where: {
        uniqueCode,
      },
    });
  }

  async findStudentOrTeacherInClass(
    classId: string,
    userId: string,
    roleId: string,
  ) {
    if (roleId === ROLES.TEACHER) {
      const teacher = await this.prismaService.classTeachers.findFirst({
        where: {
          classId,
          teacherId: userId,
        },
      });
      return teacher;
    }
    const student = await this.prismaService.classStudents.findFirst({
      where: {
        classId,
        studentId: userId,
      },
    });
    return student;
  }

  async inviteGroupUserToClass(classId: string, expiredAt: string) {
    return this.prismaService.classLinkInvitations.create({
      data: {
        classId,
        expiredAt,
      },
    });
  }

  async findInvitationById(id: string) {
    return this.prismaService.classLinkInvitations.findUnique({
      where: {
        id,
      },
    });
  }

  async findInvitationByClassId(classId: string) {
    return this.prismaService.classLinkInvitations.findFirst({
      where: {
        classId,
      },
    });
  }

  async deleteInvitations(classId: string) {
    return this.prismaService.classLinkInvitations.deleteMany({
      where: {
        classId,
      },
    });
  }

  async deleteInvitationById(id: string) {
    return this.prismaService.classLinkInvitations.delete({
      where: {
        id,
      },
    });
  }

  async deleteGrades(classId: string) {
    return this.prismaService.grades.deleteMany({
      where: {
        classId,
      },
    });
  }

  async createGrade(classId: string, createGradeDto: CreateGradeDto) {
    return Promise.all(
      createGradeDto.grades.map(async (grade) => {
        return this.prismaService.grades.create({
          data: {
            classId,
            name: grade.name,
            percentage: grade.percentage,
          },
        });
      }),
    );
  }

  async updateGrade(
    id: string,
    updateGradeDto: Prisma.gradesUncheckedUpdateInput,
  ) {
    return this.prismaService.grades.update({
      where: {
        id,
      },
      data: updateGradeDto,
    });
  }
  async getGrades(classId: string) {
    return this.prismaService.grades.findMany({
      where: {
        classId,
      },
      include: {
        assignments: {
          include: {
            studentAssignments: {
              select: {
                score: true,
                studentId: true,
                students: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    uniqueId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getTeachersOfClass(classId: string) {
    return this.prismaService.classTeachers.findMany({
      where: {
        classId,
      },
      include: {
        teachers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
      },
    });
  }
}
