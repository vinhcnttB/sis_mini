import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const classStudents = await prisma.classStudents.findMany({
    take: 10,
    include: {
      classes: true,
      students: true,
    }
  });

  console.log("Class Students:");
  console.dir(classStudents, { depth: null });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
