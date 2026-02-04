import VehicleForm from "@/components/VehicleForm";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";

export default async function NewVehiclePage() {
  const taxiOwners = await prisma.taxiOwner.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>
        Add New Vehicle
      </h1>
      <VehicleForm taxiOwners={taxiOwners} />
    </div>
  );
}
