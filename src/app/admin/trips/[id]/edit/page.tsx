import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminTripForm from "@/components/AdminTripForm";

export const dynamic = "force-dynamic";

export default async function EditTripPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = parseInt(params.id);
  if (isNaN(id)) return notFound();

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return notFound();

  const drivers = await prisma.user.findMany({ where: { role: "DRIVER" } });
  const vehicles = await prisma.vehicle.findMany();
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
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Edit Trip #{trip.id}
      </h1>
      <AdminTripForm
        trip={trip}
        drivers={drivers}
        vehicles={vehicles}
        contractors={contractors}
      />
    </div>
  );
}
