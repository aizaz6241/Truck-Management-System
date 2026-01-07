"use client";

import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DeleteTripButton from "./DeleteTripButton";

export default function DriverDashboardClient({
    trips,
    vehicles,
    totalTrips,
    tripSaved
}: {
    trips: any[],
    vehicles: any[],
    totalTrips: number,
    tripSaved?: boolean
}) {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for filters to avoid constant reload on typing
    const [filterVehicle, setFilterVehicle] = useState(searchParams.get("vehicleId") || "");
    const [filterDate, setFilterDate] = useState(searchParams.get("date") || "");
    const [filterMaterial, setFilterMaterial] = useState(searchParams.get("materialType") || "");

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filterVehicle) params.set("vehicleId", filterVehicle);
        if (filterDate) params.set("date", filterDate);
        if (filterMaterial) params.set("materialType", filterMaterial);
        if (tripSaved) params.set("tripSaved", "true");

        router.push(`/driver?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilterVehicle("");
        setFilterDate("");
        setFilterMaterial("");
        router.push("/driver");
    };

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h1 style={{ textAlign: "center" }}>{t("driver.dashboard")}</h1>

            {tripSaved && (
                <div style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "1rem",
                    borderRadius: "4px",
                    margin: "1rem auto",
                    maxWidth: "500px",
                    border: "1px solid #c3e6cb",
                    textAlign: "center"
                }}>
                    {t("trip.add")} - Success! (Trip saved)
                </div>
            )}

            <div style={{ margin: "2rem 0", textAlign: "center" }}>
                <Link href="/driver/trips/new" className="btn btn-primary" style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}>
                    {t("trip.add")}
                </Link>
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3>{t("driver.pageTitle")} ({totalTrips})</h3>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "end" }}>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <label className="form-label" style={{ marginBottom: "0.25rem" }}>{t("trip.vehicle")}</label>
                        <select className="form-select" value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
                            <option value="">{t("trip.selectVehicle")}</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.number}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <label className="form-label" style={{ marginBottom: "0.25rem" }}>{t("trip.material")}</label>
                        <input className="form-input" placeholder={t("trip.material")} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <label className="form-label" style={{ marginBottom: "0.25rem" }}>{t("trip.date")}</label>
                        <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={applyFilters}>Filter</button>
                    <button className="btn" style={{ background: "#ccc" }} onClick={clearFilters}>Reset</button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--border-color)" }}>
                        <thead>
                            <tr style={{ backgroundColor: "var(--background-color)", textAlign: "left" }}>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>{t("trip.date")}</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>{t("trip.vehicle")}</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>{t("trip.from")} / {t("trip.to")}</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>{t("trip.material")}</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(trip => (
                                <tr key={trip.id}>
                                    <td style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                                        {new Date(trip.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                                        {trip.vehicle.number}
                                    </td>
                                    <td style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                                        {trip.fromLocation} &rarr; {trip.toLocation}
                                    </td>
                                    <td style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                                        {trip.materialType || "-"}
                                    </td>
                                    <td style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        {trip.paperImage && (
                                            <a href={trip.paperImage} target="_blank" className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "#17a2b8", color: "white", textDecoration: "none" }}>{t("trip.paper")}</a>
                                        )}
                                        <Link href={`/driver/trips/${trip.id}/edit`} className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "var(--primary-color)", color: "white", textDecoration: "none" }}>{t("common.edit")}</Link>
                                        <DeleteTripButton id={trip.id} />
                                    </td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: "1rem", textAlign: "center" }}>No trips found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
