"use client";

import { useActionState, useState } from "react";
import { createTrip, updateTrip } from "@/actions/trip";
import { useLanguage } from "@/components/LanguageProvider";
import { UploadButton } from "@/utils/uploadthing";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TripForm({ driverName, vehicles, initialData }: { driverName: string, vehicles: any[], initialData?: any }) {
    const updateTripWithId = initialData ? updateTrip.bind(null, initialData.id) : null;
    const action = initialData ? updateTripWithId! : createTrip;

    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, { message: "" });
    const { t } = useLanguage();

    // State for Cloud Upload
    const [uploadedUrl, setUploadedUrl] = useState<string>(initialData?.paperImage || "");
    const [uploadError, setUploadError] = useState("");

    const defaultDate = initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const defaultTime = initialData?.date ? new Date(initialData.date).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5);

    return (
        <form action={formAction} className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
            {state?.message && <div style={{ color: "red", marginBottom: "1rem" }}>{state.message}</div>}

            <div className="form-group">
                <label className="form-label">{t("trip.driver")}</label>
                <input className="form-input" value={driverName} disabled style={{ backgroundColor: "#e9ecef" }} />
                <input type="hidden" name="driverId" value={initialData?.driverId || ""} />
            </div>

            <div className="form-group">
                <label className="form-label">{t("trip.vehicle")}</label>
                <select name="vehicleId" className="form-select" required defaultValue={initialData?.vehicleId || ""}>
                    <option value="" disabled>{t("trip.selectVehicle")}</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.number} - {v.model}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">{t("trip.from")}</label>
                <input name="fromLocation" defaultValue={initialData?.fromLocation} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">{t("trip.to")}</label>
                <input name="toLocation" defaultValue={initialData?.toLocation} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">{t("trip.date")}</label>
                <input name="date" type="date" defaultValue={defaultDate} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Time</label>
                <input name="time" type="time" defaultValue={defaultTime} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">{t("trip.material")}</label>
                <select name="materialType" className="form-select" required defaultValue={initialData?.materialType || ""}>
                    <option value="" disabled>{t("trip.selectMaterial")}</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Asphalt">Asphalt</option>
                    <option value="Road Base">Road Base</option>
                    <option value="Waste Material">Waste Material</option>
                    <option value="Ramal">Ramal</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">{t("trip.upload")}</label>

                {/* UploadThing Button */}
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
                        {/* Hidden input to send URL to server action */}
                        <input type="hidden" name="paperUrl" value={uploadedUrl} />
                    </div>
                )}
                {uploadError && <p style={{ color: "red", fontSize: "0.8rem" }}>Upload Failed: {uploadError}</p>}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                    disabled={isPending}
                >
                    {isPending ? <><LoadingSpinner size={16} /> Processing...</> : (initialData ? "Update Trip" : t("common.submit"))}
                </button>
            </div>
        </form>
    );
}
