import { prisma } from "@/lib/db";
import VehicleProfileClient from "@/components/vehicle/VehicleProfileClient";
import { notFound } from "next/navigation";

export default async function VehicleProfilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = parseInt(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      taxiOwner: true,
    },
  });

  if (!vehicle) {
    notFound();
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "date";
  const order = searchParams.order === "asc" ? "asc" : "desc";
  const pageSize = 50; // Smaller page size for profile view

  // OrderBy for Trips
  let orderBy: any = { date: "desc" };
  if (sort === "driver") {
    orderBy = [{ date: "desc" }, { driver: { name: order } }];
  } else if (sort === "contractor") {
    orderBy = [{ date: "desc" }, { contractor: { name: order } }];
  } else if (sort === "date") {
    orderBy = { date: order };
  }

  // Fetch Trips
  const totalTrips = await prisma.trip.count({ where: { vehicleId: id } });
  const totalPages = Math.ceil(totalTrips / pageSize);
  const trips = await prisma.trip.findMany({
    where: { vehicleId: id },
    take: pageSize,
    skip: (page - 1) * pageSize,
    include: {
      driver: true,
      vehicle: true,
      images: true,
      contractor: true,
      invoice: { include: { contractor: true } },
    },
    orderBy,
  });

  // Fetch Diesel Records (All for now, or filter by date? Fetching default all for list)
  const dieselRecords = await prisma.diesel.findMany({
    where: { vehicleId: id },
    orderBy: { date: "desc" },
    include: {
      driver: true,
      vehicle: true,
    },
  });

  // Helper for Route Map (Same logic as TripsPage)
  const siteMaterials = await prisma.siteMaterial.findMany({
    include: {
      site: {
        include: {
          contractor: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  const routeContractorMap: Record<string, { id: number; name: string }> = {};
  siteMaterials.forEach((sm) => {
    if (sm.site.contractor) {
      const key = `${sm.locationFrom}|${sm.locationTo}`;
      routeContractorMap[key] = sm.site.contractor;
    }
  });

  return (
    <VehicleProfileClient
      vehicle={vehicle}
      trips={trips}
      dieselRecords={dieselRecords}
      totalPages={totalPages}
      currentPage={page}
      totalTripsCount={totalTrips}
      routeContractorMap={routeContractorMap}
      searchParams={searchParams}
    />
  );
}
