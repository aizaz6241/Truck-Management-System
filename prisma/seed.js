const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@truck.com' },
    update: {},
    create: {
      email: 'admin@truck.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
