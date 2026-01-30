import { getDieselRecords, getDieselStats } from "@/actions/diesel";
import { getAllVehicles } from "@/actions/vehicle";
import { getDrivers } from "@/actions/driver";
import DieselList from "@/components/diesel/DieselList";
import {
  BeakerIcon,
  BanknotesIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";
import DieselStatsOverview from "@/components/diesel/DieselStatsOverview";

export const dynamic = "force-dynamic";

export default async function DieselPage() {
  const [dieselData, statsData, vehiclesData, driversData] = await Promise.all([
    getDieselRecords(),
    getDieselStats(),
    getAllVehicles(),
    getDrivers(),
  ]);

  const records = dieselData.success ? (dieselData.data ?? []) : [];
  const stats =
    statsData.success && statsData.data
      ? statsData.data
      : { totalLiters: 0, totalCost: 0 };

  const vehicles = vehiclesData.success ? (vehiclesData.data ?? []) : [];
  const drivers = driversData.success ? (driversData.data ?? []) : [];

  return (
    <div className="diesel-page-container">
      {/* Header Section */}
      <div className="diesel-header-section">
        <h1 className="diesel-title">Fuel Management</h1>
        <p className="diesel-subtitle">
          Track fuel consumption, analyze costs, and manage vehicle fuel records
          efficiently.
        </p>
      </div>

      {/* Stats Cards */}
      <DieselStatsOverview stats={stats} records={records} />

      {/* Main Content */}
      <DieselList initialData={records} vehicles={vehicles} drivers={drivers} />
    </div>
  );
}
