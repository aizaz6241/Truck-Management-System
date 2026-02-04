
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function backup() {
  console.log("Starting backup...");
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(__dirname, "../backups");
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Fetch all data
  const data = {
    users: await prisma.user.findMany(),
    contractors: await prisma.contractor.findMany(),
    sites: await prisma.site.findMany(),
    siteMaterials: await prisma.siteMaterial.findMany(),
    vehicles: await prisma.vehicle.findMany(),
    taxiOwners: await prisma.taxiOwner.findMany(),
    // Invoices must be before Trips (because Trip has invoiceId)
    invoices: await prisma.invoice.findMany(),
    trips: await prisma.trip.findMany(),
    tripImages: await prisma.tripImage.findMany(),
    payments: await prisma.payment.findMany(),
    diesels: await prisma.diesel.findMany(),
    statements: await prisma.statement.findMany(),
    contractorMaterials: await prisma.contractorMaterial.findMany(),
    contractorDocuments: await prisma.contractorDocument.findMany(),
    activityLogs: await prisma.activityLog.findMany(),
    dismissedNotifications: await prisma.dismissedNotification.findMany(),
  };

  // Write to file
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

  console.log(`Backup completed successfully!`);
  console.log(`Saved to: ${backupFile}`);
}

backup()
  .catch((e) => {
    console.error("Backup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
