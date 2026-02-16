import { prisma } from "@/lib/db";
import DriverProfileClient from "@/components/driver/DriverProfileClient";
import { notFound } from "next/navigation";

export default async function DriverProfilePage(props: {
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

  // Fetch Driver
  const driver = await prisma.user.findUnique({
    where: { id },
  });

  if (!driver) {
    notFound();
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "date";
  const order = searchParams.order === "asc" ? "asc" : "desc";
  const pageSize = 50;

  // OrderBy for Trips
  let orderBy: any = { date: "desc" };
  if (sort === "vehicle") {
    orderBy = [{ date: "desc" }, { vehicle: { number: order } }];
  } else if (sort === "contractor") {
    orderBy = [{ date: "desc" }, { contractor: { name: order } }];
  } else if (sort === "date") {
    orderBy = { date: order };
  }

  // Fetch Trips
  const totalTrips = await prisma.trip.count({ where: { driverId: id } });
  const totalPages = Math.ceil(totalTrips / pageSize);
  const trips = await prisma.trip.findMany({
    where: { driverId: id },
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

  // Helper for Route Map
  // Only sites associated with trips? Or all routes.
  // Better to fetch all relevant site materials for mapping used in table
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
    <DriverProfileClient
      driver={driver}
      trips={trips}
      totalPages={totalPages}
      currentPage={page}
      totalTripsCount={totalTrips}
      routeContractorMap={routeContractorMap}
      searchParams={searchParams}
    />
  );
}
