import { prisma } from "@/lib/db";
import Link from "next/link";
import { getAnalyticsData } from "@/lib/analytics";
import DashboardCharts from "@/components/DashboardCharts";
import {
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const vehicleCount = await prisma.vehicle.count();
  const driverCount = await prisma.user.count({ where: { role: "DRIVER" } });
  const tripCount = await prisma.trip.count();
  const { todayTrips, trend7Days, trend30Days, trend1Year } =
    await getAnalyticsData();

  // Fetch Diesel Records for Analytics
  const dieselRecords = await prisma.diesel.findMany({
    orderBy: { date: "desc" },
    include: {
      vehicle: {
        select: {
          id: true,
          number: true,
        },
      },
    },
  });

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Vehicles Card */}
        <div
          className="card hover:shadow-lg transition-all duration-300"
          style={{
            padding: "1.5rem",
            borderLeft: "4px solid #3b82f6",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                }}
              >
                Total Vehicles
              </p>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#111827",
                  lineHeight: "1",
                }}
              >
                {vehicleCount}
              </p>
            </div>
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "0.75rem",
                backgroundColor: "#eff6ff",
                color: "#3b82f6",
              }}
            >
              <TruckIcon style={{ width: "32px", height: "32px" }} />
            </div>
          </div>
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <Link
              href="/admin/vehicles"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#3b82f6",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              Manage Fleet{" "}
              <ArrowRightIcon style={{ width: "16px", height: "16px" }} />
            </Link>
          </div>
        </div>

        {/* Drivers Card */}
        <div
          className="card hover:shadow-lg transition-all duration-300"
          style={{
            padding: "1.5rem",
            borderLeft: "4px solid #10b981",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                }}
              >
                Total Drivers
              </p>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#111827",
                  lineHeight: "1",
                }}
              >
                {driverCount}
              </p>
            </div>
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "0.75rem",
                backgroundColor: "#ecfdf5",
                color: "#10b981",
              }}
            >
              <UserGroupIcon style={{ width: "32px", height: "32px" }} />
            </div>
          </div>
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <Link
              href="/admin/drivers"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#10b981",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              View Drivers{" "}
              <ArrowRightIcon style={{ width: "16px", height: "16px" }} />
            </Link>
          </div>
        </div>

        {/* Trips Card */}
        <div
          className="card hover:shadow-lg transition-all duration-300"
          style={{
            padding: "1.5rem",
            borderLeft: "4px solid #8b5cf6",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                }}
              >
                Total Trips
              </p>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#111827",
                  lineHeight: "1",
                }}
              >
                {tripCount}
              </p>
            </div>
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "0.75rem",
                backgroundColor: "#f5f3ff",
                color: "#8b5cf6",
              }}
            >
              <MapIcon style={{ width: "32px", height: "32px" }} />
            </div>
          </div>
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <Link
              href="/admin/trips"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#8b5cf6",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              Trip History{" "}
              <ArrowRightIcon style={{ width: "16px", height: "16px" }} />
            </Link>
          </div>
        </div>
      </div>

      <DashboardCharts
        todayTrips={todayTrips}
        trend7Days={trend7Days}
        trend30Days={trend30Days}
        trend1Year={trend1Year}
        dieselRecords={dieselRecords}
      />
    </div>
  );
}
