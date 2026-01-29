const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in database:');
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}, Status: ${u.isActive ? 'Active' : 'Inactive'}`);
  });
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
