"use client";

import { useActionState, useState } from "react";
import { createTrip, updateTrip } from "@/actions/trip";
import { useLanguage } from "@/components/LanguageProvider";

export default function TripForm({ driverName, vehicles, initialData }: { driverName: string, vehicles: any[], initialData?: any }) {
    const updateTripWithId = initialData ? updateTrip.bind(null, initialData.id) : null;
    const action = initialData ? updateTripWithId! : createTrip;

    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, { message: "" });
    const { t } = useLanguage();
    const [fileName, setFileName] = useState<string>(initialData?.paperImage ? "Existing file attached" : "");

    const defaultDate = initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <form action={formAction} className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
            {state?.message && <div style={{ color: "red", marginBottom: "1rem" }}>{state.message}</div>}

            <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input className="form-input" value={driverName} disabled style={{ backgroundColor: "#e9ecef" }} />
                {/* Ensure driverId is sent even if disabled input doesn't send it? Actually createTrip gets ID from session. updateTrip gets it from form. */}
                {/* For update, we need to send driverId if the action expects it. The action reads driverId from formData. 
                    If input is disabled, it's not sent. 
                    However, createTrip uses usage session. updateTrip uses formData.
                    We should add a hidden input for driverId if editing, or ensure the select below covers it? 
                    Wait, driverId isn't a select here, it's implied for Driver. 
                    In Admin form, it's a select.
                    In TripForm (Driver view), driver name is read-only.
                    Let's add a hidden input for driverId just in case, or reliance on session for safety?
                    Actually, updateTrip reads `formData.get("driverId")`.
                    If we don't send it, updateTrip might fail or zero it out.
                    But wait, updateTrip was built for Admin (who picks driver).
                    Drivers shouldn't change the driver (themselves).
                    We should probably inject the current driver ID via hidden input.
                */}
                <input type="hidden" name="driverId" value={initialData?.driverId || ""} />
            </div>

            <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select name="vehicleId" className="form-select" required defaultValue={initialData?.vehicleId || ""}>
                    <option value="" disabled>-- Select Vehicle --</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.number} - {v.model}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">From Location</label>
                <input name="fromLocation" defaultValue={initialData?.fromLocation} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">To Location</label>
                <input name="toLocation" defaultValue={initialData?.toLocation} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Date</label>
                <input name="date" type="date" defaultValue={defaultDate} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Material Type</label>
                <select name="materialType" className="form-select" required defaultValue={initialData?.materialType || ""}>
                    <option value="" disabled>-- Select Material --</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Asphalt">Asphalt</option>
                    <option value="Road Base">Road Base</option>
                    <option value="Waste Material">Waste Material</option>
                    <option value="Ramal">Ramal</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Upload Paper</label>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                    {/* Gallery Button */}
                    <label className="btn" style={{ flex: 1, textAlign: "center", cursor: "pointer", backgroundColor: "#6c757d", color: "white" }}>
                        Select from Gallery
                        <input type="file" name="paper" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                    </label>
                    {/* Camera Button */}
                    <label className="btn" style={{ flex: 1, textAlign: "center", cursor: "pointer", backgroundColor: "#17a2b8", color: "white" }}>
                        Capture with Camera
                        <input type="file" name="paper_camera" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => {
                            // Copy to main input if needed, or backend handles both. 
                            // Backend needs to check both names or loop formData.
                            // Simpler: Just name them same? No, browser might not allow two inputs with same name to submit if one is empty.
                            // Actually, if we use same name 'paper', formData.getAll('paper') will have both.
                            // We can use same name 'paper' for both inputs. One will be empty, one will have file.
                            handleFileChange(e);
                        }} />
                        {/* 
                           Duplicate name issue: If user picks file in one, other is empty. 
                           FormData will likely send two 'paper' entries. 
                           Backend logic `paperFile = formData.get('paper')` picks the FIRST one. 
                           If the first one is empty, it might fail.
                           Let's use DIFFERENT names and handle in backend.
                           Backend check: `formData.get('paper')` OR `formData.get('paperCamera')`.
                           Updated backend already uses 'paper'. I will start with 'paper' for gallery and use 'paper' for camera too? 
                           No, safer to use 'paper' for gallery and 'paperCamera' for camera and update backend to check both.
                           Wait, I need to update backend then. 
                           Updated backend code: `const paperFile = formData.get("paper") as File;`
                           I'll update it to check both.
                        */}
                    </label>
                </div>
                {/* Re-implementing with distinct names for safety */}
                <input type="file" id="paper_gallery" name="paper" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                <input type="file" id="paper_camera" name="paperCamera" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />

                <div style={{ display: "flex", gap: "1rem" }}>
                    <label htmlFor="paper_gallery" className="btn" style={{ flex: 1, textAlign: "center", cursor: "pointer", backgroundColor: "#6c757d", color: "white" }}>
                        Gallery
                    </label>
                    <label htmlFor="paper_camera" className="btn" style={{ flex: 1, textAlign: "center", cursor: "pointer", backgroundColor: "#17a2b8", color: "white" }}>
                        Camera
                    </label>
                </div>
                {fileName && <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "green" }}>Selected: {fileName}</div>}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    {initialData ? "Update Trip" : t("common.submit")}
                </button>
            </div>
        </form>
    );
}
