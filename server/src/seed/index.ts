import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLES = {
  ADMIN: '9b18fbd22d07cdb410d015b4',
  USER: '97bc64ef328c22ca3a91b642',
  TEACHER: '22d89fb9b72cae80471abce2',
  STUDENT: '0c9831eefcebfaf65307082a',
};

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.studentRequestedReviewConversation.deleteMany();
  await prisma.studentRequestedReviews.deleteMany();
  await prisma.studentAssignmentSubmissions.deleteMany();
  await prisma.studentAssignments.deleteMany();
  await prisma.assignmentsScoreHistories.deleteMany();
  await prisma.assignments.deleteMany();
  await prisma.grades.deleteMany();
  await prisma.classStudents.deleteMany();
  await prisma.classTeachers.deleteMany();
  await prisma.classLinkInvitations.deleteMany();
  await prisma.classes.deleteMany();
  await prisma.users.deleteMany();
  await prisma.roles.deleteMany();

  console.log('Seeding Roles...');
  const roleData = [
    { id: '0c9831eefcebfaf65307082a', name: 'student' },
    { id: '22d89fb9b72cae80471abce2', name: 'teacher' },
    { id: '9b18fbd22d07cdb410d015b4', name: 'admin' },
    { id: '97bc64ef328c22ca3a91b642', name: 'user' },
  ];
  await prisma.roles.createMany({ data: roleData });

  console.log('Seeding Users...');
  const defaultPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.users.create({
    data: {
      email: 'admin@example.com',
      encryptedPassword: defaultPassword,
      firstName: 'Admin',
      lastName: 'User',
      uniqueId: 'ADMIN001',
      roleId: ROLES.ADMIN,
      emailVerified: true,
      status: true,
    }
  });

  const teacher = await prisma.users.create({
    data: {
      email: 'teacher@example.com',
      encryptedPassword: defaultPassword,
      firstName: 'Nguyen',
      lastName: 'Van Giao Vien',
      uniqueId: 'GV001',
      roleId: ROLES.TEACHER,
      emailVerified: true,
      status: true,
    }
  });

  const student = await prisma.users.create({
    data: {
      email: 'student@example.com',
      encryptedPassword: defaultPassword,
      firstName: 'Tran',
      lastName: 'Hoc Sinh',
      uniqueId: 'HS001',
      roleId: ROLES.STUDENT,
      emailVerified: true,
      status: true,
    }
  });

  console.log('Seeding Class...');
  const newClass = await prisma.classes.create({
    data: {
      name: 'Lập trình Web Nâng cao',
      uniqueCode: 'WEBNC2026',
      maximumStudents: 50,
      description: 'Lớp học mẫu cho project',
      classTeachers: {
        create: {
          teacherId: teacher.id,
          isCreator: true,
        }
      },
      classStudents: {
        create: {
          studentId: student.id,
        }
      }
    }
  });

  console.log('Seeding Grades & Assignments...');
  const grade1 = await prisma.grades.create({
    data: {
      name: 'Giữa kỳ',
      percentage: 30,
      classId: newClass.id,
    }
  });

  const grade2 = await prisma.grades.create({
    data: {
      name: 'Cuối kỳ',
      percentage: 70,
      classId: newClass.id,
    }
  });

  const assignment1 = await prisma.assignments.create({
    data: {
      name: 'Bài tập nhóm Giữa kỳ',
      description: 'Hoàn thành ứng dụng web',
      classId: newClass.id,
      gradeId: grade1.id,
      teacherId: teacher.id,
      dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
    }
  });

  await prisma.studentAssignments.create({
    data: {
      studentId: student.id,
      assignmentId: assignment1.id,
      score: 8.5,
      status: 'GRADED',
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
