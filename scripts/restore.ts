
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function restore() {
  const backupDir = path.join(__dirname, "../backups");

  // Get the latest backup file
  if (!fs.existsSync(backupDir)) {
    console.error("No backups found!");
    process.exit(1);
  }

  const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.error("No backup JSON files found in backups directory.");
    process.exit(1);
  }

  // Sort by name (timestamp) descending
  const latestBackup = files.sort().reverse()[0];
  const backupPath = path.join(backupDir, latestBackup);

  console.log(`Restoring from: ${backupPath}`);
  const data = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

  // Clear existing data (Order matters for FK constraints!)
  // Delete children first, then parents
  console.log("Clearing current database...");
  await prisma.tripImage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.trip.deleteMany(); // Depends on Invoice, Vehicle, Driver
  await prisma.invoice.deleteMany(); // Depends on Contractor
  await prisma.diesel.deleteMany(); // Depends on Vehicle, Driver
  await prisma.siteMaterial.deleteMany();
  await prisma.site.deleteMany(); // Depends on Contractor
  await prisma.contractorMaterial.deleteMany();
  await prisma.contractorDocument.deleteMany();
  await prisma.statement.deleteMany();
  await prisma.vehicle.deleteMany(); // Depends on TaxiOwner
  await prisma.contractor.deleteMany();
  await prisma.taxiOwner.deleteMany();
  await prisma.user.deleteMany(); // User is root for Driver
  await prisma.activityLog.deleteMany();
  await prisma.dismissedNotification.deleteMany();

  console.log("Database cleared. Inserting data...");

  // Insert Parents First
  if (data.users?.length) await prisma.user.createMany({ data: data.users });
  if (data.taxiOwners?.length) await prisma.taxiOwner.createMany({ data: data.taxiOwners });
  if (data.contractors?.length) await prisma.contractor.createMany({ data: data.contractors });
  
  // Level 1 Dependents
  if (data.vehicles?.length) await prisma.vehicle.createMany({ data: data.vehicles });
  if (data.contractorDocuments?.length) await prisma.contractorDocument.createMany({ data: data.contractorDocuments });
  if (data.contractorMaterials?.length) await prisma.contractorMaterial.createMany({ data: data.contractorMaterials });
  if (data.statements?.length) await prisma.statement.createMany({ data: data.statements });
  if (data.sites?.length) await prisma.site.createMany({ data: data.sites });

  // Level 2 Dependents
  if (data.siteMaterials?.length) await prisma.siteMaterial.createMany({ data: data.siteMaterials });
  if (data.invoices?.length) await prisma.invoice.createMany({ data: data.invoices });
  if (data.diesels?.length) await prisma.diesel.createMany({ data: data.diesels });

  // Level 3 Dependents
  if (data.trips?.length) await prisma.trip.createMany({ data: data.trips });
  
  // Level 4 Dependents
  if (data.tripImages?.length) await prisma.tripImage.createMany({ data: data.tripImages });
  if (data.payments?.length) await prisma.payment.createMany({ data: data.payments });

  // Others
  if (data.activityLogs?.length) await prisma.activityLog.createMany({ data: data.activityLogs });
  if (data.dismissedNotifications?.length) await prisma.dismissedNotification.createMany({ data: data.dismissedNotifications });

  console.log("Restore completed successfully!");
}

restore()
  .catch((e) => {
    console.error("Restore failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
