import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DriverDashboardClient from "@/components/DriverDashboardClient";
import { redirect } from "next/navigation";

export default async function DriverDashboard(props: {
  searchParams: Promise<{
    tripSaved?: string;
    vehicleId?: string;
    date?: string;
    materialType?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const driverId = session.user.id;
  const vehicleId = searchParams.vehicleId
    ? parseInt(searchParams.vehicleId)
    : undefined;
  const date = searchParams.date;
  const materialType = searchParams.materialType;

  const where: any = { driverId };
  if (vehicleId) where.vehicleId = vehicleId;
  if (materialType) where.materialType = { contains: materialType }; // Partial match
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = {
      gte: start,
      lt: end,
    };
  }

  const trips = await prisma.trip.findMany({
    where,
    include: { vehicle: true, images: true },
    orderBy: { date: "desc" },
  });

  const dieselRecords = await prisma.diesel.findMany({
    where: { driverId },
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: { date: "desc" },
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { status: "Active" },
    include: { diesel: true },
  });

  return (
    <DriverDashboardClient
      trips={trips}
      vehicles={vehicles}
      dieselRecords={dieselRecords}
      totalTrips={trips.length}
      tripSaved={!!searchParams.tripSaved}
      driver={{ id: session.user.id, name: session.user.name || "Driver" }}
    />
  );
}
