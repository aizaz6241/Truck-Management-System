import { prisma } from "@/lib/db";
import AdminTripForm from "@/components/AdminTripForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewTripPage() {
  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER", isActive: true },
  });
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "Active" },
  });
  const contractors = await prisma.contractor.findMany({
    where: { status: "Active" },
    include: {
      sites: {
        where: { status: "Active" },
        include: { materials: true },
      },
    },
  });

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/admin/trips"
          style={{ color: "var(--primary-color)", textDecoration: "underline" }}
        >
          &larr; Back to Trips
        </Link>
      </div>

      <AdminTripForm
        drivers={drivers}
        vehicles={vehicles}
        contractors={contractors}
      />
    </div>
  );
}
