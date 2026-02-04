
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "aizaz@gmail.com";
  const password = "aizaz123";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Creating admin user: ${email}...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      name: "Aizaz Admin", // Default name
    },
    create: {
      email,
      password: hashedPassword,
      name: "Aizaz Admin",
      role: "ADMIN",
      isActive: true,
      phone: "0000000000", // Default dummy phone
    },
  });

  console.log("Admin user created successfully:", user);
}

createAdmin()
  .catch((e) => {
    console.error("Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
