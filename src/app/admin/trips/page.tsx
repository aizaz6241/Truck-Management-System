import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteTripButton from "@/components/DeleteTripButton";
import ViewPaperButton from "@/components/ViewPaperButton";
import TripFilters from "@/components/TripFilters";
import { Fragment } from "react";
import {
  ArrowLongUpIcon,
  ArrowLongDownIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import TripPaperStatus from "@/components/TripPaperStatus";

export default async function TripsPage(props: {
  searchParams: Promise<{
    driverId?: string;
    vehicleId?: string;
    contractorId?: string;
    date?: string;
    materialType?: string;
    ownership?: string;
    serialNumber?: string;

    page?: string;
    month?: string;
    year?: string;

    sort?: string;
    order?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const driverId = searchParams.driverId
    ? parseInt(searchParams.driverId)
    : undefined;
  const vehicleId = searchParams.vehicleId
    ? parseInt(searchParams.vehicleId)
    : undefined;
  const date = searchParams.date;
  const materialType = searchParams.materialType;
  const ownership = searchParams.ownership;
  const serialNumber = searchParams.serialNumber;
  const month = searchParams.month ? parseInt(searchParams.month) : undefined;
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "date";
  const order = searchParams.order === "asc" ? "asc" : "desc";

  const pageSize = 100;

  const contractorId = searchParams.contractorId
    ? parseInt(searchParams.contractorId)
    : undefined;

  const drivers = await prisma.user.findMany({ where: { role: "DRIVER" } });
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "Active" },
  });
  const contractors = await prisma.contractor.findMany({
    select: { id: true, name: true },
  });

  // Get SiteMaterials to infer contractor from route
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

  // Build a map for quick route lookup: "From|To" -> Contractor
  const routeContractorMap: Record<string, { id: number; name: string }> = {};
  siteMaterials.forEach((sm) => {
    if (sm.site.contractor) {
      const key = `${sm.locationFrom}|${sm.locationTo}`;
      // Prefer specific material match if needed, but for now map route to contractor
      // Note: If multiple contractors use same route, this naive map might pick one arbitrarily.
      // But typically routes are site-specific.
      routeContractorMap[key] = sm.site.contractor;
    }
  });

  const where: any = {};
  if (driverId) where.driverId = driverId;
  if (vehicleId) where.vehicleId = vehicleId;
  if (materialType) where.materialType = { contains: materialType }; // Partial match
  if (ownership) where.vehicle = { ownership: ownership };
  if (serialNumber) where.serialNumber = { contains: serialNumber }; // Partial match
  if (contractorId) {
    // Complex filter: Trip can be linked via Invoice OR via Route
    // Prisma doesn't support advanced OR across relations and non-relations comfortably in one object without complex syntax.
    // simpler approach: Find IDs of trips that match the route condition first?
    // No, that's too heavy.
    // Better: Use OR condition.

    // 1. Routes belonging to this contractor
    const contractorRoutes = siteMaterials
      .filter((sm) => sm.site.contractorId === contractorId)
      .map((sm) => ({
        fromLocation: sm.locationFrom,
        toLocation: sm.locationTo,
      }));

    where.OR = [
      { invoice: { contractorId: contractorId } },
      // Add route conditions
      ...contractorRoutes.map((route) => ({
        AND: [
          { fromLocation: route.fromLocation },
          { toLocation: route.toLocation },
        ],
      })),
    ];
  }

  // Date Filtering Logic
  if (date) {
    // Specific date takes precedence
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  } else if (year) {
    if (month) {
      // Specific Month and Year
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      // end needs to be start of next month to be exclusive or handle time correctly.
      // Using month index + 1 ensures we get the first moment of next month
      const nextMonth = new Date(year, month, 1);
      where.date = { gte: start, lt: nextMonth };
    } else {
      // Whole Year
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);
      where.date = { gte: start, lt: end };
    }
  }

  // Helper to build sort links
  const getSortLink = (field: string) => {
    const isCurrentSort = sort === field;
    const newOrder = isCurrentSort && order === "asc" ? "desc" : "asc";
    const params = new URLSearchParams();
    if (driverId) params.set("driverId", driverId.toString());
    if (vehicleId) params.set("vehicleId", vehicleId.toString());
    if (date) params.set("date", date);
    if (materialType) params.set("materialType", materialType);
    if (ownership) params.set("ownership", ownership);
    if (serialNumber) params.set("serialNumber", serialNumber);
    if (contractorId) params.set("contractorId", contractorId.toString());
    if (year) params.set("year", year.toString());
    if (month) params.set("month", month.toString());
    if (page > 1) params.set("page", page.toString());

    params.set("sort", field);
    params.set("order", newOrder);

    return `?${params.toString()}`;
  };

  const getSortIcon = (field: string) => {
    if (sort !== field)
      return <ArrowsUpDownIcon style={{ width: "14px", marginLeft: "4px" }} />;
    return order === "asc" ? (
      <ArrowLongUpIcon style={{ width: "14px", marginLeft: "4px" }} />
    ) : (
      <ArrowLongDownIcon style={{ width: "14px", marginLeft: "4px" }} />
    );
  };

  // Determine OrderBy
  let orderBy: any = { date: "desc" };
  if (sort === "driver") {
    // Primary sort by Date (to keep grouping clean), Secondary by Driver
    orderBy = [{ date: "desc" }, { driver: { name: order } }];
  } else if (sort === "contractor") {
    orderBy = [{ date: "desc" }, { contractor: { name: order } }];
  } else if (sort === "date") {
    orderBy = { date: order };
  }

  const totalTrips = await prisma.trip.count({ where });
  const totalPages = Math.ceil(totalTrips / pageSize);

  const trips = (await prisma.trip.findMany({
    where,
    take: pageSize,
    skip: (page - 1) * pageSize,
    include: {
      driver: true,
      vehicle: true,
      images: true,
      contractor: true, // Included Explicit Contractor
      invoice: { include: { contractor: true } },
    } as any, // Included Invoice & Contractor
    orderBy,
  })) as any;

  // Grouping by Date (Partitioning) - Always active to satisfy "Separated by Date" requirement
  const groupedTrips: { [key: string]: typeof trips } = {};
  trips.forEach((trip: any) => {
    const dateKey = new Date(trip.date).toDateString();
    if (!groupedTrips[dateKey]) groupedTrips[dateKey] = [];
    groupedTrips[dateKey].push(trip);
  });

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1>
          Trip Records{" "}
          <span
            style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}
          >
            ({totalTrips} Total)
          </span>
        </h1>
        <Link
          href="/admin/trips/new"
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span>+</span> New Trip
        </Link>
      </div>

      {/* Filter Component */}
      <TripFilters
        drivers={drivers}
        vehicles={vehicles}
        contractors={contractors}
        searchParams={searchParams}
      />

      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            minWidth: "900px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--background-color)",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={getSortLink("date")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Date {getSortIcon("date")}
                </Link>
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={getSortLink("driver")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Driver {getSortIcon("driver")}
                </Link>
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Vehicle
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Owner
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={getSortLink("contractor")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Contractor {getSortIcon("contractor")}
                </Link>
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Serial No
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Route
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Material
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Paper
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Paper Status
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedTrips).map(([groupTitle, groupTrips]) => (
              <Fragment key={groupTitle}>
                <tr style={{ backgroundColor: "#e9ecef" }}>
                  <td
                    colSpan={11}
                    style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}
                  >
                    {groupTitle}
                  </td>
                </tr>
                {groupTrips.map((trip: any) => (
                  <tr key={trip.id}>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "#6b7280",
                      }}
                    >
                      #{trip.id}
                    </td>
                    {/* Format time separately if DateTime has time, otherwise just standard date */}
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {new Date(trip.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.driver.name}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.vehicle.number}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor:
                            trip.vehicle.ownership === "RVT"
                              ? "#e3f2fd"
                              : "#fff3e0",
                          color:
                            trip.vehicle.ownership === "RVT"
                              ? "var(--primary-color)"
                              : "#e67e22",
                          fontSize: "0.875rem",
                        }}
                      >
                        {trip.vehicle.ownership}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {trip.contractor?.name ||
                        trip.invoice?.contractor?.name ||
                        routeContractorMap[
                          `${trip.fromLocation}|${trip.toLocation}`
                        ]?.name ||
                        "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {trip.serialNumber || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.fromLocation} &rarr; {trip.toLocation}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.materialType || "-"}
                    </td>

                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.paperImage ||
                      (trip.images && trip.images.length > 0) ? (
                        <ViewPaperButton
                          imageUrl={
                            trip.paperImage || trip.images[0]?.url || ""
                          }
                          images={trip.images.map((i: any) => i.url)}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <TripPaperStatus
                        id={trip.id}
                        initialStatus={trip.paperStatus}
                      />
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Link
                          href={`/admin/trips/${trip.id}/edit`}
                          style={{ color: "var(--primary-color)" }}
                        >
                          Edit
                        </Link>
                        <DeleteTripButton id={trip.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            {trips.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  style={{ padding: "1rem", textAlign: "center" }}
                >
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/admin/trips?page=1&driverId=${driverId || ""}&vehicleId=${vehicleId || ""}&date=${date || ""}&year=${year || ""}&month=${month || ""}&materialType=${materialType || ""}&ownership=${ownership || ""}&sort=${sort}&order=${order}`}
            className={`btn ${page <= 1 ? "disabled" : ""}`}
            style={{
              pointerEvents: page <= 1 ? "none" : "auto",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            First
          </Link>
          <Link
            href={`/admin/trips?page=${page - 1}&driverId=${driverId || ""}&vehicleId=${vehicleId || ""}&date=${date || ""}&year=${year || ""}&month=${month || ""}&materialType=${materialType || ""}&ownership=${ownership || ""}&sort=${sort}&order=${order}`}
            className={`btn ${page <= 1 ? "disabled" : ""}`}
            style={{
              pointerEvents: page <= 1 ? "none" : "auto",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Prev
          </Link>

          {/* Page Numbers (Simple range for now, or just current/total) */}
          <span
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            Page {page} of {totalPages}
          </span>

          <Link
            href={`/admin/trips?page=${page + 1}&driverId=${driverId || ""}&vehicleId=${vehicleId || ""}&date=${date || ""}&year=${year || ""}&month=${month || ""}&materialType=${materialType || ""}&ownership=${ownership || ""}&sort=${sort}&order=${order}`}
            className={`btn ${page >= totalPages ? "disabled" : ""}`}
            style={{
              pointerEvents: page >= totalPages ? "none" : "auto",
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
