"use client";

import { useActionState, useState, useMemo } from "react";
import { createTrip, updateTrip } from "@/actions/trip";
import { useLanguage } from "@/components/LanguageProvider";
import { UploadButton } from "@/utils/uploadthing";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TripForm({
  driverName,
  vehicles,
  contractors = [],
  initialData,
}: {
  driverName: string;
  vehicles: any[];
  contractors?: any[];
  initialData?: any;
}) {
  console.log("Rendering TripForm", {
    driverName,
    vehiclesCount: vehicles.length,
    initialData,
  });
  const updateTripWithId = initialData
    ? updateTrip.bind(null, initialData.id)
    : null;
  const action = initialData ? updateTripWithId! : createTrip;

  // Cascading Dropdown State
  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>(
    initialData ? `${initialData.fromLocation}|${initialData.toLocation}` : "",
  );

  // Memoized lists based on selection
  const sites = useMemo(() => {
    if (!selectedContractorId) return [];
    const contractor = contractors.find(
      (c: any) => c.id.toString() === selectedContractorId,
    );
    return contractor?.sites || [];
  }, [selectedContractorId, contractors]);

  const siteMaterials = useMemo(() => {
    if (!selectedSiteId) return [];
    const site = sites.find((s: any) => s.id.toString() === selectedSiteId);
    if (!site) return [];
    // @ts-ignore
    const materials = site.materials || [];
    // Get unique names
    const names = Array.from(new Set(materials.map((m: any) => m.name)));
    return names;
  }, [selectedSiteId, sites]);

  const materialRoutes = useMemo(() => {
    if (!selectedSiteId || !selectedMaterialName) return [];
    const site = sites.find((s: any) => s.id.toString() === selectedSiteId);
    // @ts-ignore
    return (
      site?.materials.filter((m: any) => m.name === selectedMaterialName) || []
    );
  }, [selectedSiteId, selectedMaterialName, sites]);

  // @ts-ignore
  const [state, formAction, isPending] = useActionState(action, {
    message: "",
  });
  const { t } = useLanguage();

  // State for Cloud Upload
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(
    initialData?.images?.map((img: any) => img.url) ||
      (initialData?.paperImage ? [initialData.paperImage] : []),
  );
  const [uploadError, setUploadError] = useState("");

  const defaultDate = initialData?.date
    ? new Date(initialData.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const defaultTime = initialData?.date
    ? new Date(initialData.date).toTimeString().slice(0, 5)
    : new Date().toTimeString().slice(0, 5);

  return (
    <form
      action={formAction}
      className="card"
      style={{ maxWidth: "500px", margin: "0 auto" }}
    >
      {state?.message && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {state.message}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">{t("trip.driver")}</label>
        <input
          className="form-input"
          value={driverName}
          disabled
          style={{ backgroundColor: "#e9ecef" }}
        />
        <input
          type="hidden"
          name="driverId"
          value={initialData?.driverId || ""}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t("trip.vehicle")}</label>
        <select
          name="vehicleId"
          className="form-select"
          required
          defaultValue={initialData?.vehicleId || ""}
        >
          <option value="" disabled>
            {t("trip.selectVehicle")}
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.number} - {v.model}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t("trip.from")}</label>
        {/* Helper inputs for form submission */}
        {/* If creating new trip, we use cascading dropdowns */}
        {!initialData && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {/* Contractor Selection */}
            <div>
              <label
                className="form-label"
                style={{ fontSize: "0.85rem", color: "#666" }}
              >
                Company / Contractor
              </label>
              <select
                className="form-select"
                value={selectedContractorId}
                onChange={(e) => {
                  setSelectedContractorId(e.target.value);
                  setSelectedSiteId("");
                  setSelectedMaterialName("");
                  setSelectedRoute("");
                }}
                required
              >
                <option value="">Select Company</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Site Selection */}
            <div>
              <label
                className="form-label"
                style={{ fontSize: "0.85rem", color: "#666" }}
              >
                Site
              </label>
              <select
                className="form-select"
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  setSelectedMaterialName("");
                  setSelectedRoute("");
                }}
                disabled={!selectedContractorId}
                required
              >
                <option value="">Select Site</option>
                {sites.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Material Name Selection */}
            <div>
              <label
                className="form-label"
                style={{ fontSize: "0.85rem", color: "#666" }}
              >
                Material Type
              </label>
              <select
                name="materialType"
                className="form-select"
                value={selectedMaterialName}
                onChange={(e) => {
                  setSelectedMaterialName(e.target.value);
                  setSelectedRoute("");
                }}
                disabled={!selectedSiteId}
                required
              >
                <option value="">Select Material</option>
                {/* @ts-ignore */}
                {siteMaterials.map((name: string) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Route Selection */}
            <div>
              <label
                className="form-label"
                style={{ fontSize: "0.85rem", color: "#666" }}
              >
                Route (From - To)
              </label>
              <select
                className="form-select"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                disabled={!selectedMaterialName}
                required
              >
                <option value="">Select Route</option>
                {/* @ts-ignore */}
                {materialRoutes.map((m: any) => (
                  <option
                    key={m.id}
                    value={`${m.locationFrom}|${m.locationTo}`}
                  >
                    {m.locationFrom} &rarr; {m.locationTo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Hidden inputs to feed the server action with expected field names */}
        <input
          type={initialData ? "text" : "hidden"} // Show if editing (fallback), hidden if new
          name="fromLocation"
          value={initialData ? undefined : selectedRoute.split("|")[0] || ""}
          defaultValue={initialData?.fromLocation}
          className={initialData ? "form-input" : ""}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t("trip.to")}</label>
        <input
          type={initialData ? "text" : "hidden"}
          name="toLocation"
          value={initialData ? undefined : selectedRoute.split("|")[1] || ""}
          defaultValue={initialData?.toLocation}
          className={initialData ? "form-input" : ""}
          required
        />
        {/* If creating new, show read-only text of selected route */}
        {!initialData && selectedRoute && (
          <div
            style={{
              marginTop: "-0.5rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            {selectedRoute.split("|")[0]} &rarr; {selectedRoute.split("|")[1]}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">{t("trip.date")}</label>
        <input
          name="date"
          type="date"
          defaultValue={defaultDate}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Time</label>
        <input
          name="time"
          type="time"
          defaultValue={defaultTime}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t("trip.upload")}</label>

        {/* UploadThing Button */}
        <div style={{ marginBottom: "1rem" }}>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res: any) => {
              if (res && res.length > 0) {
                const newUrls = res.map((r: any) => r.url);
                setUploadedUrls((prev) => [...prev, ...newUrls]);
                alert("Upload Completed");
              }
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
              setUploadError(error.message);
            }}
          />
        </div>

        {uploadedUrls.length > 0 && (
          <div style={{ marginTop: "0.5rem" }}>
            <p style={{ color: "green", fontSize: "0.9rem" }}>
              {uploadedUrls.length} Image(s) Attached Successfully
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {uploadedUrls.map((url, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.8rem",
                      textDecoration: "underline",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    View Image {idx + 1}
                  </a>
                  <input type="hidden" name="paperUrls" value={url} />
                  {/* Remove button could go here */}
                  <button
                    type="button"
                    onClick={() =>
                      setUploadedUrls((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    style={{
                      color: "red",
                      fontSize: "0.7rem",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    [Remove]
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {uploadError && (
          <p style={{ color: "red", fontSize: "0.8rem" }}>
            Upload Failed: {uploadError}
          </p>
        )}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
          }}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoadingSpinner size={16} /> Processing...
            </>
          ) : initialData ? (
            "Update Trip"
          ) : (
            t("common.submit")
          )}
        </button>
      </div>
    </form>
  );
}
