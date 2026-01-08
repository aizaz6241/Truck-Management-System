"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TripFilters({
    drivers,
    vehicles,
    searchParams
}: {
    drivers: any[],
    vehicles: any[],
    searchParams: any
}) {
    const [isOpen, setIsOpen] = useState(false);

    // Check if any filter is active
    const activeFilters = searchParams.driverId || searchParams.vehicleId || searchParams.date ||
        searchParams.materialType || searchParams.ownership ||
        searchParams.year || searchParams.month;

    return (
        <div style={{ marginBottom: "1.5rem" }}>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: isOpen ? "1rem" : 0,
                    width: "100%",
                    justifyContent: "space-between",
                    backgroundColor: activeFilters ? "#e3f2fd" : "white",
                    border: activeFilters ? "1px solid var(--primary-color)" : "1px solid #ddd",
                    color: activeFilters ? "var(--primary-color)" : "inherit"
                }}
            >
                <span style={{ fontWeight: 600 }}>
                    Filters {activeFilters && "(Active)"}
                </span>
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>

            {/* Filter Form - conditionally visible */}
            <div style={{ display: isOpen ? "block" : "none" }}>
                <form className="card filter-bar" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end", padding: "1rem" }}>
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
                    <div style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button type="submit" className="btn btn-primary">Apply Filters</button>
                        <Link href="/admin/trips" className="btn" style={{ backgroundColor: "#ccc" }}>Reset</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
