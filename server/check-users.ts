import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  console.log('Total users:', users.length);
  console.log(users);
}
main().finally(() => prisma.$disconnect());
