"use client";

import { useActionState, useState } from "react";
import { createTrip, updateTrip } from "@/actions/trip";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UploadButton } from "@/utils/uploadthing";

export default function AdminTripForm({ trip, drivers, vehicles }: { trip?: any, drivers: any[], vehicles: any[] }) {


    // ... previous code ...

    const action = trip ? updateTrip.bind(null, trip.id) : createTrip;
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, { message: "" });
    const [uploadedUrl, setUploadedUrl] = useState<string>(trip?.paperImage || "");
    const [uploadError, setUploadError] = useState("");

    const defaultDate = trip?.date ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const defaultTime = trip?.date ? new Date(trip.date).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5);

    return (
        <form action={formAction} className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {state?.message && <div style={{ color: "red", marginBottom: "1rem" }}>{state.message}</div>}

            <div className="form-group">
                <label className="form-label">Driver</label>
                <select name="driverId" className="form-select" required defaultValue={trip?.driverId || ""}>
                    <option value="" disabled>Select Driver</option>
                    {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select name="vehicleId" className="form-select" required defaultValue={trip?.vehicleId || ""}>
                    <option value="" disabled>Select Vehicle</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.number}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">From</label>
                <input name="fromLocation" defaultValue={trip?.fromLocation} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">To</label>
                <input name="toLocation" defaultValue={trip?.toLocation} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Date</label>
                <input name="date" type="date" defaultValue={defaultDate} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Time</label>
                <input name="time" type="time" defaultValue={defaultTime} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Material</label>
                <select name="materialType" className="form-select" required defaultValue={trip?.materialType || ""}>
                    <option value="" disabled>Select Material</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Asphalt">Asphalt</option>
                    <option value="Road Base">Road Base</option>
                    <option value="Waste Material">Waste Material</option>
                    <option value="Ramal">Ramal</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Upload Paper</label>
                <div style={{ marginBottom: "1rem" }}>
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: any) => {
                            if (res && res[0]) {
                                setUploadedUrl(res[0].url);
                                alert("Upload Completed");
                            }
                        }}
                        onUploadError={(error: Error) => {
                            alert(`ERROR! ${error.message}`);
                            setUploadError(error.message);
                        }}
                    />
                </div>
                {uploadedUrl && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <p style={{ color: "green", fontSize: "0.9rem" }}>Image Attached Successfully</p>
                        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", textDecoration: "underline" }}>View Image</a>
                        <input type="hidden" name="paperUrl" value={uploadedUrl} />
                    </div>
                )}
                {uploadError && <p style={{ color: "red", fontSize: "0.8rem" }}>Upload Failed: {uploadError}</p>}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }} disabled={isPending}>
                    {isPending ? <><LoadingSpinner size={16} /> Processing...</> : (trip ? "Update Trip" : "Create Trip")}
                </button>
            </div>
        </form>
    );
}
