import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteDriverButton from "@/components/DeleteDriverButton";

export default async function DriversPage() {
    const drivers = await prisma.user.findMany({
        where: { role: "DRIVER" },
        orderBy: { createdAt: "desc" }
    });

    const totalDrivers = drivers.length;

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1>Driver Management <span style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}>({totalDrivers} Total)</span></h1>
                <Link href="/admin/drivers/new" className="btn btn-primary">Add New Driver</Link>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--background-color)", textAlign: "left" }}>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Name</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Email/Username</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Phone</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Salary</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Status</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map(driver => (
                            <tr key={driver.id}>
                                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{driver.name}</td>
                                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{driver.email}</td>
                                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{driver.phone || "-"}</td>
                                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                    {driver.salary || "-"}
                                </td>
                                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                    <span style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "4px",
                                        backgroundColor: driver.isActive ? "#d4edda" : "#f8d7da",
                                        color: driver.isActive ? "#155724" : "#721c24",
                                        fontSize: "0.875rem"
                                    }}>
                                        {driver.isActive ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                    <Link href={`/admin/drivers/${driver.id}/edit`} style={{ marginRight: "1rem", color: "var(--primary-color)" }}>Edit</Link>
                                    <DeleteDriverButton id={driver.id} />
                                </td>
                            </tr>
                        ))}
                        {drivers.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: "1rem", textAlign: "center" }}>No drivers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
