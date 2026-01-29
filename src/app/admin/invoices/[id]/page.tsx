import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EditableInvoicePage from "@/components/EditableInvoicePage";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  // @ts-ignore
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  // @ts-ignore
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      contractor: true,
      trips: {
        include: {
          vehicle: true,
        },
      },
    },
  });

  if (!invoice) notFound();

  // --- Initial Aggregation Logic (Fallback if no metadata) ---
  const summaryItems: {
    [key: string]: {
      material: string;
      route: string;
      quantity: number;
      unit: string;
      price: number;
      total: number;
      description?: string; // Optional custom description
    };
  } = {};

  invoice.trips.forEach((trip: any) => {
    const key = `${trip.materialType}-${trip.fromLocation}-${trip.toLocation}`;
    if (!summaryItems[key]) {
      summaryItems[key] = {
        material: trip.materialType,
        route: `${trip.fromLocation} to ${trip.toLocation}`,
        quantity: 0,
        unit: "Trips",
        price: 0,
        total: 0,
      };
    }
    summaryItems[key].quantity += 1;
  });

  const lineItems = Object.values(summaryItems);

  if (lineItems.length === 1) {
    lineItems[0].total = invoice.totalAmount;
    lineItems[0].price = invoice.totalAmount / lineItems[0].quantity;
  } else if (lineItems.length > 0) {
    const totalQty = lineItems.reduce((sum, item) => sum + item.quantity, 0);
    lineItems.forEach((item) => {
      item.price = invoice.totalAmount / totalQty;
      item.total = item.price * item.quantity;
    });
  }

  // Pass to client component
  return <EditableInvoicePage invoice={invoice} initialLineItems={lineItems} />;
}
