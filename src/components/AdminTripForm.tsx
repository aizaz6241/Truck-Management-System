"use client";

import { useActionState, useState, useMemo } from "react";
import { createTrip, updateTrip } from "@/actions/trip";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UploadButton } from "@/utils/uploadthing";

// Adding contractors prop
export default function AdminTripForm({
  trip,
  drivers,
  vehicles,
  contractors = [],
}: {
  trip?: any;
  drivers: any[];
  vehicles: any[];
  contractors?: any[];
}) {
  const action = trip ? updateTrip.bind(null, trip.id) : createTrip;
  // @ts-ignore
  const [state, formAction, isPending] = useActionState(action, {
    message: "",
  });
  const [uploadedUrl, setUploadedUrl] = useState<string>(
    trip?.paperImage || "",
  );
  const [uploadError, setUploadError] = useState("");

  const defaultDate = trip?.date
    ? new Date(trip.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const defaultTime = trip?.date
    ? new Date(trip.date).toTimeString().slice(0, 5)
    : new Date().toTimeString().slice(0, 5);

  // Cascading State
  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>(
    trip ? `${trip.fromLocation}|${trip.toLocation}` : "",
  );

  // Memoized Lists
  const sites = useMemo(() => {
    if (!selectedContractorId) return [];
    const contractor = contractors.find(
      (c) => c.id.toString() === selectedContractorId,
    );
    return contractor?.sites || [];
  }, [selectedContractorId, contractors]);

  const siteMaterials = useMemo(() => {
    if (!selectedSiteId) return [];
    const site = sites.find((s: any) => s.id.toString() === selectedSiteId);
    // @ts-ignore
    const materials = site?.materials || [];
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

  return (
    <form
      action={formAction}
      className="card"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      {state?.message && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {state.message}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Driver</label>
        <select
          name="driverId"
          className="form-select"
          required
          defaultValue={trip?.driverId || ""}
        >
          <option value="" disabled>
            Select Driver
          </option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Vehicle</label>
        <select
          name="vehicleId"
          className="form-select"
          required
          defaultValue={trip?.vehicleId || ""}
        >
          <option value="" disabled>
            Select Vehicle
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.number}
            </option>
          ))}
        </select>
      </div>

      {/* Cascading Logic */}
      <div className="form-group">
        <label className="form-label">Trip Details</label>

        {/* On Edit, we might fallback to manual text inputs if we can't reconstruct state easily, 
                    OR we just show the inputs and user can modify. 
                    Actually, if editing, sticking to Manual Input might be safer unless we want to force re-selection.
                    Current NewTrip logic uses cascading. Edit trip logic in original was manual inputs.
                    Let's keep Cascading for NEW trips. For EDIT trips, we show the manual inputs but populate defaults.
                    Or we can offer cascading as an option.
                    For simplicity, let's replicate TripForm logic: If !initialData (trip), show cascading.
                */}

        {!trip && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <div>
              <label className="form-label" style={{ fontSize: "0.9rem" }}>
                Contractor
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
                <option value="">Select Contractor</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: "0.9rem" }}>
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

            <div>
              <label className="form-label" style={{ fontSize: "0.9rem" }}>
                Material
              </label>
              <select
                name="materialType" // This actually sets the submitted field
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
                {siteMaterials.map((name: any) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: "0.9rem" }}>
                Route
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
      </div>

      {/* Hidden/Explicit Inputs for From/To */}
      <div className="form-group">
        <label className="form-label">From</label>
        <input
          name="fromLocation"
          defaultValue={trip?.fromLocation}
          value={!trip ? selectedRoute.split("|")[0] || "" : undefined}
          className="form-input"
          required
          readOnly={!trip} // Read-only if using dropdowns
        />
      </div>

      <div className="form-group">
        <label className="form-label">To</label>
        <input
          name="toLocation"
          defaultValue={trip?.toLocation}
          value={!trip ? selectedRoute.split("|")[1] || "" : undefined}
          className="form-input"
          required
          readOnly={!trip}
        />
      </div>

      {/* If Edit Mode, Show Material Input explicitly too since Dropdown might hide it?
                Actually we used `name="materialType"` in the dropdown above.
                But if we are Editing, we need a text input for Material if we aren't using the dropdowns.
            */}
      {trip && (
        <div className="form-group">
          <label className="form-label">Material</label>
          <input
            name="materialType"
            defaultValue={trip?.materialType}
            className="form-input"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Date</label>
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
            <p style={{ color: "green", fontSize: "0.9rem" }}>
              Image Attached Successfully
            </p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.8rem", textDecoration: "underline" }}
            >
              View Image
            </a>
            <input type="hidden" name="paperUrl" value={uploadedUrl} />
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
          ) : trip ? (
            "Update Trip"
          ) : (
            "Create Trip"
          )}
        </button>
      </div>
    </form>
  );
}
