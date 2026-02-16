import { prisma } from "@/lib/db";
import Link from "next/link";
import DriverCard from "@/components/DriverCard";
import DriverAnalytics from "@/components/DriverAnalytics";

export default async function DriversPage() {
  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    include: {
      trips: {
        select: { date: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalDrivers = drivers.length;

  // Transform data for analytics (ensure dates are correct type if needed)
  const analyticsData = drivers.map((d) => ({
    id: d.id,
    name: d.name,
    trips: d.trips,
  }));

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1>
          Driver Management{" "}
          <span
            style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}
          >
            ({totalDrivers} Total)
          </span>
        </h1>
        <Link href="/admin/drivers/new" className="btn btn-primary">
          Add New Driver
        </Link>
      </div>

      {/* Analytics Section */}
      <DriverAnalytics drivers={analyticsData} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {drivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>

      {drivers.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          No drivers found.
        </div>
      )}
    </div>
  );
}
