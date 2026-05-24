import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compact, map } from 'lodash';
import { PrismaService } from 'src/prisma.service';
import { REQUESTED_REVIEW_STATUS } from 'src/utils';

@Injectable()
export class AssignmentsService {
  // eslint-disable-next-line prettier/prettier
  constructor(readonly primsaService: PrismaService) {}
  async createAssignment(data: Prisma.assignmentsUncheckedCreateInput) {
    return this.primsaService.assignments.create({
      data,
    });
  }

  async updateAssignment(
    id: string,
    data: Prisma.assignmentsUncheckedUpdateInput,
  ) {
    return this.primsaService.assignments.update({
      where: { id },
      data,
    });
  }

  async updateStudentAssignment(
    id: string,
    data: Prisma.studentAssignmentsUncheckedUpdateInput,
  ) {
    return this.primsaService.studentAssignments.update({
      where: { id },
      data,
    });
  }

  async getAllAssignments(classId: string) {
    return this.primsaService.assignments.findMany({
      where: {
        classId,
      },
      include: {
        classes: true,
        grades: true,
        studentAssignments: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markScoreForAssignment(
    data: Prisma.studentAssignmentsUncheckedCreateInput[],
  ) {
    return compact(
      await Promise.all(
        map(data, async (assignment) => {
          const { studentId, assignmentId } = assignment;
          const studentAssignment =
            await this.primsaService.studentAssignments.findFirst({
              where: {
                studentId,
                assignmentId,
              },
            });
          if (studentAssignment) {
            return this.primsaService.studentAssignments.upsert({
              where: {
                id: studentAssignment.id,
              },
              create: assignment,
              update: assignment,
            });
          } else {
            return this.primsaService.studentAssignments.create({
              data: assignment,
            });
          }
          return null;
        }),
      ),
    );
  }

  async getAssignment(id: string) {
    return this.primsaService.assignments.findUnique({
      where: { id },
      include: {
        classes: true,
        grades: true,
        studentAssignments: {
          include: {
            students: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async createStudentAssignment(
    data: Prisma.studentAssignmentsUncheckedCreateInput,
  ) {
    return this.primsaService.studentAssignments.create({
      data,
    });
  }

  async createRequestedGradeView(
    data: Prisma.studentRequestedReviewsUncheckedCreateInput,
  ) {
    return this.primsaService.studentRequestedReviews.create({
      data,
    });
  }

  async getRequestedGradeView(id: string) {
    return this.primsaService.studentRequestedReviews.findMany({
      where: {
        assignmentId: id,
      },
      include: {
        students: true,
      },
    });
  }

  async getRequestGradeViewDetail(id: string) {
    return this.primsaService.studentRequestedReviews.findUnique({
      where: {
        id,
      },
      include: {
        students: true,
      },
    });
  }

  async updateRequestedGradeView(
    id: string,
    data: Prisma.studentRequestedReviewsUncheckedUpdateInput,
  ) {
    return this.primsaService.studentRequestedReviews.update({
      where: { id },
      data,
    });
  }

  async getStudentAssignment(id: string) {
    return this.primsaService.studentAssignments.findUnique({
      where: {
        id,
      },
      include: {
        students: true,
        assignments: true,
      },
    });
  }

  async createConversation(
    id: string,
    data: Prisma.studentRequestedReviewConversationUncheckedCreateInput,
  ) {
    return this.primsaService.studentRequestedReviewConversation.create({
      data: {
        ...data,
        studentRequestedId: id,
      },
    });
  }

  async getConversation(id: string) {
    return this.primsaService.studentRequestedReviewConversation.findMany({
      where: {
        studentRequestedId: id,
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            avatar: true,
            lastName: true,
            uniqueId: true,
          },
        },
      },
    });
  }
}
