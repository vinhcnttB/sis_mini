import { PrismaClient } from '@prisma/client';
import { map } from 'lodash';

const prisma = new PrismaClient();

async function main() {
  const classId = '6a0e7ded53789cdf25cdf6f0'; // from previous script

  const exClass = await prisma.classes.findUnique({
    where: {
      id: classId,
      isDisabled: false
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
        where: {
          isDisabled: false,
        },
      },
    },
  });

  if (!exClass) {
    console.log("Class not found!");
    return;
  }

  console.log("exClass.classStudents:", JSON.stringify(exClass.classStudents, null, 2));

  const students = map(exClass.classStudents, 'students').filter(Boolean);
  
  console.log("mapped students count:", students.length);
  console.log("mapped students:", students);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
