import { prisma } from "../src/lib/db";

async function main() {
    const invoices = await prisma.invoice.findMany({
        where: { id: { in: [2, 3, 4] } }
    });
    console.log("Invoices found:", invoices);
    
    // Also check for orphaned trips
    const orphanedTrips = await prisma.trip.findMany({
        where: {
            invoiceId: { not: null },
            invoice: { is: null } // This syntax might not work directly if Relation is optional? 
            // Better: find trips where invoiceId is NOT null, but the invoice doesn't exist.
        }
    });
    // Prisma doesn't support "invoice: {is: null}" for checking broken foreign keys easily if not enforced by DB?
    // Foreign keys usually enforce this. If I deleted invoice, it should have failed if FK constraint exists, or set null, or cascade.
    // If FK constraint exists, we can't have orphans.
    // Let's just inspect the invoices first.
}

main();
