import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import InvoiceList from "@/components/InvoiceList";

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  // Fetch Invoices
  // @ts-ignore
  const invoices = await prisma.invoice.findMany({
    include: {
      contractor: true,
      trips: {
        select: { materialType: true },
        take: 1, // We assume matched uniformity or just take the first as representative
      },
      // Note: payments are loaded on demand or aggregated.
      // We rely on paidAmount field on Invoice which is updated by action.
    },
    orderBy: { date: "desc" },
  });

  // Fetch Contractors for the Modal
  const contractors = await prisma.contractor.findMany({
    where: { status: "Active" },
    orderBy: { name: "asc" },
  });

  // Serialize dates for client component
  const serializedInvoices = invoices.map((inv: any) => ({
    ...inv,
    date: inv.date.toISOString(),
    totalAmount: inv.totalAmount, // Ensure number
    paidAmount: inv.paidAmount || 0,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
    material: inv.trips[0]?.materialType || "Unknown",
    isReceived: inv.isReceived || false,
    receivedDate: inv.receivedDate ? inv.receivedDate.toISOString() : undefined,
    receivedCopyUrl: inv.receivedCopyUrl || undefined,
  }));

  return (
    <InvoiceList
      initialInvoices={serializedInvoices}
      contractors={contractors}
    />
  );
}
