import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteTripButton from "@/components/DeleteTripButton";
import ViewPaperButton from "@/components/ViewPaperButton";
import { Fragment } from "react";

export default async function TripsPage(props: {
    searchParams: Promise<{
        driverId?: string,
        vehicleId?: string,
        date?: string,
        materialType?: string,
        ownership?: string,

        page?: string,
        month?: string,
        year?: string
    }>
}) {
    const searchParams = await props.searchParams;
    const driverId = searchParams.driverId ? parseInt(searchParams.driverId) : undefined;
    const vehicleId = searchParams.vehicleId ? parseInt(searchParams.vehicleId) : undefined;
    const date = searchParams.date;
    const materialType = searchParams.materialType;
    const ownership = searchParams.ownership;
    const month = searchParams.month ? parseInt(searchParams.month) : undefined;
    const year = searchParams.year ? parseInt(searchParams.year) : undefined;
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const pageSize = 100;

    const where: any = {};
    if (driverId) where.driverId = driverId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (materialType) where.materialType = { contains: materialType }; // Partial match
    if (ownership) where.vehicle = { ownership: ownership };

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

    const totalTrips = await prisma.trip.count({ where });
    const totalPages = Math.ceil(totalTrips / pageSize);

    const trips = await prisma.trip.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: { driver: true, vehicle: true },
        orderBy: { date: "desc" }
    });

    // Grouping by Date (Partitioning)
    const groupedTrips: { [key: string]: typeof trips } = {};
    trips.forEach(trip => {
        const dateKey = new Date(trip.date).toDateString();
        if (!groupedTrips[dateKey]) groupedTrips[dateKey] = [];
        groupedTrips[dateKey].push(trip);
    });

    const drivers = await prisma.user.findMany({ where: { role: "DRIVER" } });
    const vehicles = await prisma.vehicle.findMany({ where: { status: "Active" } });

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1>Trip Records <span style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}>({totalTrips} Total)</span></h1>
                <Link href="/admin/trips/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>+</span> New Trip
                </Link>
            </div>

            {/* Filter Form */}
            <form className="card filter-bar" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end", margin: "1.5rem 0", padding: "1rem" }}>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Driver</label>
                    <select name="driverId" defaultValue={searchParams.driverId} className="form-select">
                        <option value="">All Drivers</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Vehicle</label>
                    <select name="vehicleId" defaultValue={searchParams.vehicleId} className="form-select">
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.number}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Ownership</label>
                    <select name="ownership" defaultValue={searchParams.ownership} className="form-select">
                        <option value="">All Types</option>
                        <option value="RVT">RVT</option>
                        <option value="Taxi">Taxi</option>
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Material</label>
                    <input name="materialType" defaultValue={searchParams.materialType} className="form-input" placeholder="e.g. Concrete" />
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Year</label>
                    <select name="year" defaultValue={searchParams.year} className="form-select">
                        <option value="">All Years</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Month</label>
                    <select name="month" defaultValue={searchParams.month} className="form-select">
                        <option value="">All Months</option>
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                    <label className="form-label">Specific Date</label>
                    <input type="date" name="date" defaultValue={searchParams.date} className="form-input" />
                </div>
                <button type="submit" className="btn btn-primary">Filter</button>
                <Link href="/admin/trips" className="btn" style={{ backgroundColor: "#ccc" }}>Reset</Link>
            </form>

            <div className="table-responsive">
                <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)", minWidth: "900px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--background-color)", textAlign: "left" }}>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>ID</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Date</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Driver</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Vehicle</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Owner</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Route</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Material</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Paper</th>
                            <th style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedTrips).map(([dateKey, groupTrips]) => (
                            <Fragment key={dateKey}>
                                <tr style={{ backgroundColor: "#e9ecef" }}>
                                    <td colSpan={9} style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}>{dateKey}</td>
                                </tr>
                                {groupTrips.map(trip => (
                                    <tr key={trip.id}>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)", fontSize: "0.75rem", fontFamily: "monospace", color: "#6b7280" }}>#{trip.id}</td>
                                        {/* Format time separately if DateTime has time, otherwise just standard date */}
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                            {new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{trip.driver.name}</td>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{trip.vehicle.number}</td>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                            <span style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "4px",
                                                backgroundColor: trip.vehicle.ownership === "RVT" ? "#e3f2fd" : "#fff3e0",
                                                color: trip.vehicle.ownership === "RVT" ? "var(--primary-color)" : "#e67e22",
                                                fontSize: "0.875rem"
                                            }}>
                                                {trip.vehicle.ownership}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{trip.fromLocation} &rarr; {trip.toLocation}</td>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>{trip.materialType || "-"}</td>


                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                            {trip.paperImage ? (
                                                <ViewPaperButton imageUrl={trip.paperImage} />
                                            ) : "-"}
                                        </td>
                                        <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Link href={`/admin/trips/${trip.id}/edit`} style={{ color: "var(--primary-color)" }}>Edit</Link>
                                                <DeleteTripButton id={trip.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                        {trips.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ padding: "1rem", textAlign: "center" }}>No trips found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
                    <Link href={`/admin/trips?page=1&driverId=${driverId || ''}&vehicleId=${vehicleId || ''}&date=${date || ''}&year=${year || ''}&month=${month || ''}&materialType=${materialType || ''}&ownership=${ownership || ''}`}
                        className={`btn ${page <= 1 ? "disabled" : ""}`}
                        style={{ pointerEvents: page <= 1 ? 'none' : 'auto', opacity: page <= 1 ? 0.5 : 1 }}>
                        First
                    </Link>
                    <Link href={`/admin/trips?page=${page - 1}&driverId=${driverId || ''}&vehicleId=${vehicleId || ''}&date=${date || ''}&year=${year || ''}&month=${month || ''}&materialType=${materialType || ''}&ownership=${ownership || ''}`}
                        className={`btn ${page <= 1 ? "disabled" : ""}`}
                        style={{ pointerEvents: page <= 1 ? 'none' : 'auto', opacity: page <= 1 ? 0.5 : 1 }}>
                        Prev
                    </Link>

                    {/* Page Numbers (Simple range for now, or just current/total) */}
                    <span style={{ padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "4px" }}>
                        Page {page} of {totalPages}
                    </span>

                    <Link href={`/admin/trips?page=${page + 1}&driverId=${driverId || ''}&vehicleId=${vehicleId || ''}&date=${date || ''}&year=${year || ''}&month=${month || ''}&materialType=${materialType || ''}&ownership=${ownership || ''}`}
                        className={`btn ${page >= totalPages ? "disabled" : ""}`}
                        style={{ pointerEvents: page >= totalPages ? 'none' : 'auto', opacity: page >= totalPages ? 0.5 : 1 }}>
                        Next
                    </Link>
                </div>
            )}
        </div>
    );
}
