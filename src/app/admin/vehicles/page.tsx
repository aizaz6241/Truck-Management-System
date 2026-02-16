import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";
import VehicleCard from "@/components/VehicleCard";
import VehicleAnalytics from "@/components/VehicleAnalytics";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
export default async function VehiclesPage(props: {
  searchParams: Promise<{ ownership?: string; status?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const ownershipFilter = searchParams.ownership;
  const statusFilter = searchParams.status;
  const query = searchParams.q;

  const where: any = {};
  if (ownershipFilter) {
    where.ownership = ownershipFilter;
  }
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (query) {
    where.OR = [
      { number: { contains: query } },
      { model: { contains: query } },
      { ownerName: { contains: query } },
    ];
  }

  // Fetch all vehicles for statistics (optimized) with error handling
  let allVehiclesStats: {
    id: number;
    number: string;
    status: string;
    registrationExpiry: Date | null;
    trips: { date: Date }[];
  }[] = [];
  try {
    allVehiclesStats = await prisma.vehicle.findMany({
      select: {
        id: true,
        number: true,
        status: true,
        registrationExpiry: true,
        trips: {
          select: { date: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch vehicle stats:", error);
    // Return empty array to prevent crash
  }

  const now = new Date();
  const summaryStats = {
    activeCount: 0,
    expiredVehicles: [] as string[],
    expiringSoonVehicles: [] as string[],
  };

  allVehiclesStats.forEach((v) => {
    if (v.status === "Active") summaryStats.activeCount++;

    if (v.registrationExpiry) {
      const expiry = new Date(v.registrationExpiry);
      const diffTime = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        summaryStats.expiredVehicles.push(v.number);
      } else if (daysRemaining <= 30) {
        summaryStats.expiringSoonVehicles.push(v.number);
      }
    }
  });

  let vehicles: any[] = [];
  try {
    vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
  }

  const totalVehicles = vehicles.length;

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
          Vehicle Management{" "}
          <span
            style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}
          >
            ({totalVehicles} Total)
          </span>
        </h1>
        <Link href="/admin/vehicles/new" className="btn btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {/* Summary Dashboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Active Vehicles Card */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            backgroundColor: "white",
            borderLeft: "5px solid #10b981", // Green accent
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6b7280",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Active Vehicles
            </span>
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              {summaryStats.activeCount}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#d1fae5",
              padding: "12px",
              borderRadius: "50%",
            }}
          >
            <CheckCircleIcon
              style={{ width: "32px", height: "32px", color: "#059669" }}
            />
          </div>
        </div>

        {/* Expired Vehicles Card */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            backgroundColor: "white",
            borderLeft: "5px solid #ef4444", // Red accent
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6b7280",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Expired Documents
            </span>
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              {summaryStats.expiredVehicles.length}
            </span>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#ef4444",
                marginTop: "4px",
              }}
            >
              Action Required
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#fee2e2",
              padding: "12px",
              borderRadius: "50%",
            }}
          >
            <XCircleIcon
              style={{ width: "32px", height: "32px", color: "#dc2626" }}
            />
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            backgroundColor: "white",
            borderLeft: "5px solid #f59e0b", // Yellow accent
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6b7280",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Expiring Soon
            </span>
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              {summaryStats.expiringSoonVehicles.length}
            </span>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#d97706",
                marginTop: "4px",
              }}
            >
              Within 30 Days
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "12px",
              borderRadius: "50%",
            }}
          >
            <ExclamationTriangleIcon
              style={{ width: "32px", height: "32px", color: "#d97706" }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <VehicleAnalytics vehicles={allVehiclesStats} />

      {/* Filter */}
      <form
        className="card"
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label className="form-label">Search</label>
          <input
            name="q"
            defaultValue={query}
            className="form-input"
            placeholder="Search Number, Model, Owner..."
          />
        </div>
        <div style={{ width: "150px" }}>
          <label className="form-label">Ownership</label>
          <select
            name="ownership"
            defaultValue={ownershipFilter}
            className="form-select"
          >
            <option value="">All</option>
            <option value="RVT">RVT (Company)</option>
            <option value="Taxi">Taxi (Private)</option>
          </select>
        </div>
        <div style={{ width: "150px" }}>
          <label className="form-label">Status</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="form-select"
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
        <Link
          href="/admin/vehicles"
          className="btn"
          style={{ backgroundColor: "#ccc" }}
        >
          Reset
        </Link>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
        {vehicles.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "3rem",
              color: "#6b7280",
            }}
          >
            No vehicles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
