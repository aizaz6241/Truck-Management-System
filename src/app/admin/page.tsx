import { prisma } from "@/lib/db";
import Link from "next/link";
import { getAnalyticsData } from "@/lib/analytics";
import DashboardCharts from "@/components/DashboardCharts";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const vehicleCount = await prisma.vehicle.count();
    const driverCount = await prisma.user.count({ where: { role: "DRIVER" } });
    const tripCount = await prisma.trip.count();
    const { todayTrips, trend7Days, trend30Days, trend1Year } = await getAnalyticsData();

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h1>Admin Dashboard</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
                <div className="card">
                    <h3>Total Vehicles</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>{vehicleCount}</p>
                    <Link href="/admin/vehicles" style={{ color: "var(--primary-color)", textDecoration: "underline" }}>Manage Vehicles</Link>
                </div>
                <div className="card">
                    <h3>Total Drivers</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--success-color)" }}>{driverCount}</p>
                    <Link href="/admin/drivers" style={{ color: "var(--primary-color)", textDecoration: "underline" }}>Manage Drivers</Link>
                </div>
                <div className="card">
                    <h3>Total Trips</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--secondary-color)" }}>{tripCount}</p>
                    <Link href="/admin/trips" style={{ color: "var(--primary-color)", textDecoration: "underline" }}>View Trips</Link>
                </div>
            </div>

            <DashboardCharts
                todayTrips={todayTrips}
                trend7Days={trend7Days}
                trend30Days={trend30Days}
                trend1Year={trend1Year}
            />
        </div>
    );
}
