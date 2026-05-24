const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sas = await prisma.studentAssignments.findMany({
    include: {
      students: true,
      assignments: true,
    }
  });
  console.log('Total Student Assignments:', sas.length);
  sas.forEach(sa => {
    console.log({
      id: sa.id,
      studentId: sa.studentId,
      studentUniqueId: sa.students ? sa.students.uniqueId : 'N/A',
      studentName: sa.students ? `${sa.students.lastName} ${sa.students.firstName}` : 'Unknown',
      assignmentId: sa.assignmentId,
      assignmentName: sa.assignments ? sa.assignments.name : 'Unknown',
      status: sa.status,
      score: sa.score,
    });
  });
}
main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
