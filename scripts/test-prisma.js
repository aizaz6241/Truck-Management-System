
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking Prisma Client...');
  if (prisma.diesel) {
    console.log('SUCCESS: prisma.diesel exists.');
    try {
        const count = await prisma.diesel.count();
        console.log('Count:', count);
    } catch (e) {
        console.error('Error querying diesel:', e.message);
    }
  } else {
    console.error('FAILURE: prisma.diesel is Undefined!');
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
