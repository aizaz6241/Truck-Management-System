import { prisma } from "@/lib/db";
import VehicleForm from "@/components/VehicleForm";
import { notFound } from "next/navigation";

export default async function EditVehiclePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = parseInt(params.id);
  if (isNaN(id)) return notFound();

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  const taxiOwners = await prisma.taxiOwner.findMany({
    orderBy: { name: "asc" },
  });

  if (!vehicle) return notFound();

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>
        Edit Vehicle
      </h1>
      <VehicleForm vehicle={vehicle} taxiOwners={taxiOwners} />
    </div>
  );
}
