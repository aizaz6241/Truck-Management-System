"use client";

import { useActionState, useState } from "react";
import { createVehicle, updateVehicle } from "@/actions/vehicle";

export default function VehicleForm({
  vehicle,
  taxiOwners,
}: {
  vehicle?: any;
  taxiOwners?: any[];
}) {
  const updateVehicleWithId = updateVehicle.bind(null, vehicle?.id);
  const action = vehicle ? updateVehicleWithId : createVehicle;

  // Default to RVT if new, or use existing value
  const [ownership, setOwnership] = useState(vehicle?.ownership || "RVT");

  // @ts-ignore
  const [state, formAction, isPending] = useActionState(action, {
    message: "",
  });

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
        <label className="form-label">Ownership</label>
        <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="ownership"
              value="RVT"
              checked={ownership === "RVT"}
              onChange={() => setOwnership("RVT")}
            />
            RVT (Company)
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="ownership"
              value="Taxi"
              checked={ownership === "Taxi"}
              onChange={() => setOwnership("Taxi")}
            />
            Taxi (Private)
          </label>
        </div>
      </div>

      {ownership === "Taxi" && (
        <div className="form-group">
          <label className="form-label">Select Taxi Owner</label>
          {taxiOwners && taxiOwners.length > 0 ? (
            <select
              name="taxiOwnerId"
              className="form-select"
              defaultValue={vehicle?.taxiOwnerId || ""}
              required
              onChange={(e) => {
                const selectedOwner = taxiOwners.find(
                  (o: any) => o.id.toString() === e.target.value,
                );
                if (selectedOwner) {
                  // If we want to sync ownerName, we can used a hidden input or state.
                  // But standard form submission will send ownerName if inside form.
                  // Let's use a hidden input that updates.
                  // For now, let's just use the select. Backend handles taxiOwnerId.
                  // But backend ALSO expects ownerName for the ownership="Taxi" case in my code?
                  // My updated backend code: ownerName: ownership === "Taxi" ? ownerName : null
                  // So I should populate ownerName.
                  const nameInput = document.getElementById(
                    "hiddenOwnerName",
                  ) as HTMLInputElement;
                  if (nameInput) nameInput.value = selectedOwner.name;
                }
              }}
            >
              <option value="">-- Select Owner --</option>
              {taxiOwners.map((owner: any) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.emiratesId || "No ID"})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-red-500 text-sm">
              No taxi owners found. Please add one in Fleet &gt; Taxi Owners.
            </div>
          )}
          {/* Hidden input to ensure ownerName is sent if backend relies on it */}
          <input
            type="hidden"
            id="hiddenOwnerName"
            name="ownerName"
            defaultValue={
              vehicle?.ownerName ||
              taxiOwners?.find((o: any) => o.id === vehicle?.taxiOwnerId)
                ?.name ||
              ""
            }
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Vehicle Number</label>
        <input
          name="number"
          defaultValue={vehicle?.number}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Vehicle Type</label>
        <input
          name="type"
          defaultValue={vehicle?.type}
          className="form-input"
          placeholder="e.g. Truck, Van"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Registration Expiry</label>
        <input
          type="date"
          name="registrationExpiry"
          defaultValue={
            vehicle?.registrationExpiry
              ? new Date(vehicle.registrationExpiry).toISOString().split("T")[0]
              : ""
          }
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Model</label>
        <input
          name="model"
          defaultValue={vehicle?.model}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Capacity</label>
        <input
          name="capacity"
          defaultValue={vehicle?.capacity}
          className="form-input"
          placeholder="e.g. 5 Tons"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          name="status"
          defaultValue={vehicle?.status || "Active"}
          className="form-select"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
        <button type="submit" className="btn btn-primary">
          {vehicle ? "Update" : "Create"} Vehicle
        </button>
        <a
          href="/admin/vehicles"
          className="btn"
          style={{ backgroundColor: "#ccc" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
