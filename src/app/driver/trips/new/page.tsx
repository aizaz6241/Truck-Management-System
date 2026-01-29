import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TripForm from "@/components/TripForm";
import { redirect } from "next/navigation";

export default async function NewTripPage() {
  console.log("Rendering NewTripPage");
  const session = await getSession();
  if (!session || !session.user) redirect("/login");

  const driver = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!driver) redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { status: "Active" },
  });

  // Fetch contractors with their sites and materials for the cascading dropdowns
  const contractors = await prisma.contractor.findMany({
    where: { status: "Active" },
    include: {
      sites: {
        where: { status: "Active" },
        include: {
          materials: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>
        New Trip Entry
      </h1>
      <TripForm
        driverName={driver.name}
        vehicles={vehicles}
        contractors={contractors}
      />
    </div>
  );
}
