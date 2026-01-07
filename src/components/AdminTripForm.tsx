"use client";

import { useActionState, useState } from "react";
import { createTrip, updateTrip } from "@/actions/trip";

export default function AdminTripForm({ trip, drivers, vehicles }: { trip?: any, drivers: any[], vehicles: any[] }) {
    const action = trip ? updateTrip.bind(null, trip.id) : createTrip;
    const [state, formAction] = useActionState(action, { message: "" });

    return (
        <form action={formAction} className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>{trip ? "Edit Trip" : "New Trip"}</h2>
            {state?.message && <div style={{ color: "red", marginBottom: "1rem" }}>{state.message}</div>}

            <div className="form-group">
                <label className="form-label">Driver</label>
                <select name="driverId" defaultValue={trip?.driverId || ""} className="form-select" required>
                    <option value="">-- Select Driver --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select name="vehicleId" defaultValue={trip?.vehicleId || ""} className="form-select" required>
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.number}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">From Location</label>
                <input name="fromLocation" defaultValue={trip?.fromLocation || ""} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">To Location</label>
                <input name="toLocation" defaultValue={trip?.toLocation || ""} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Date</label>
                <input name="date" type="date" defaultValue={trip ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Material Type</label>
                <select name="materialType" defaultValue={trip?.materialType || ""} className="form-select">
                    <option value="">-- None --</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Asphalt">Asphalt</option>
                    <option value="Road Base">Road Base</option>
                    <option value="Waste Material">Waste Material</option>
                    <option value="Ramal">Ramal</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Paper Image</label>
                {trip?.paperImage && (
                    <div style={{ marginBottom: "0.5rem" }}>
                        <a href={trip.paperImage} target="_blank" style={{ color: "blue", textDecoration: "underline" }}>View Current Paper</a>
                    </div>
                )}
                <input type="file" name="paper" className="form-input" accept="image/*" />
                <small style={{ color: "#666" }}>{trip ? "Upload new file to replace current one." : "Upload paper image (optional)."}</small>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>{trip ? "Update Trip" : "Create Trip"}</button>
            </div>
        </form>
    );
}
