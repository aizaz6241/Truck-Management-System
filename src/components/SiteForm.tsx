"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSite, updateSite } from "@/lib/actions/site";
import { useLoading } from "@/components/LoadingProvider";
import {
  Contractor,
  ContractorMaterial,
  Site,
  SiteMaterial,
} from "@/types/prisma";

interface SiteFormProps {
  contractors?: (Contractor & { materials?: ContractorMaterial[] })[];
  initialData?: Site & { materials: SiteMaterial[] };
}

export default function SiteForm({
  contractors = [],
  initialData,
}: SiteFormProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const [error, setError] = useState("");
  const [selectedContractorId, setSelectedContractorId] = useState<string>(
    initialData?.contractorId?.toString() || "",
  );

  const [materials, setMaterials] = useState<
    {
      name: string;
      price: string;
      unit: string;
      locationFrom: string;
      locationTo: string;
    }[]
  >(
    initialData?.materials.map((m) => ({
      name: m.name,
      price: m.price.toString(),
      unit: m.unit,
      locationFrom: m.locationFrom,
      locationTo: m.locationTo,
    })) || [
      {
        name: "",
        price: "",
        unit: "Per Trip",
        locationFrom: "",
        locationTo: "",
      },
    ],
  );

  // Derived state for available materials from selected contractor
  const availableMaterials = useMemo(() => {
    if (!selectedContractorId) return [];
    const contractor = contractors.find(
      (c) => c.id.toString() === selectedContractorId,
    );
    return contractor?.materials || [];
  }, [selectedContractorId, contractors]);

  const handleMaterialChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        name: "",
        price: "",
        unit: "Per Trip",
        locationFrom: "",
        locationTo: "",
      },
    ]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startLoading();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const contractorId = selectedContractorId
      ? parseInt(selectedContractorId)
      : undefined;

    // Validate materials
    const validMaterials = materials
      .filter(
        (m) =>
          m.name.trim() !== "" &&
          m.price.trim() !== "" &&
          m.locationFrom.trim() !== "" &&
          m.locationTo.trim() !== "",
      )
      .map((m) => ({
        name: m.name,
        price: parseFloat(m.price),
        unit: m.unit,
        locationFrom: m.locationFrom,
        locationTo: m.locationTo,
      }));

    if (!name) {
      setError("Please fill in the site name.");
      stopLoading();
      return;
    }

    if (validMaterials.length === 0) {
      setError("Please add at least one valid material with route details.");
      stopLoading();
      return;
    }

    try {
      let result;
      if (initialData) {
        result = await updateSite(
          initialData.id,
          name,
          validMaterials,
          contractorId,
        );
      } else {
        result = await createSite(name, validMaterials, contractorId);
      }

      if (result.success) {
        router.push("/admin/sites");
        router.refresh();
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to create site");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="card">
      <h2
        style={{
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        {initialData ? "Edit Documented Site" : "Add New Documented Site"}
      </h2>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Contractor (Optional)</label>
            <select
              name="contractorId"
              className="form-input"
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
            >
              <option value="">Select Contractor</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Site Name / Project Name</label>
            <input
              name="name"
              defaultValue={initialData?.name}
              type="text"
              className="form-input"
              required
              placeholder="e.g. Pipeline Phase 1"
            />
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Materials & Routes
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {materials.map((material, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  // Adjusted grid columns for more fields
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                  gap: "0.5rem",
                  alignItems: "end",
                  padding: "1rem",
                  backgroundColor: "var(--background-color)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>
                    Material Name
                  </label>
                  {/* If contractor selected and has materials, show list datalist input */}
                  <input
                    type="text"
                    list={`contractor-materials-${index}`}
                    className="form-input"
                    value={material.name}
                    onChange={(e) =>
                      handleMaterialChange(index, "name", e.target.value)
                    }
                    placeholder="e.g. Sand"
                    required
                    style={{ fontSize: "0.9rem", padding: "0.4rem" }}
                  />
                  {availableMaterials.length > 0 && (
                    <datalist id={`contractor-materials-${index}`}>
                      {availableMaterials.map((mat) => (
                        <option key={mat.id} value={mat.name} />
                      ))}
                    </datalist>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>
                    From (Location)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={material.locationFrom}
                    onChange={(e) =>
                      handleMaterialChange(
                        index,
                        "locationFrom",
                        e.target.value,
                      )
                    }
                    placeholder="Quarry A"
                    required
                    style={{ fontSize: "0.9rem", padding: "0.4rem" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>
                    To (Location)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={material.locationTo}
                    onChange={(e) =>
                      handleMaterialChange(index, "locationTo", e.target.value)
                    }
                    placeholder="Site B"
                    required
                    style={{ fontSize: "0.9rem", padding: "0.4rem" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>
                    Price
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={material.price}
                    onChange={(e) =>
                      handleMaterialChange(index, "price", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    required
                    style={{ fontSize: "0.9rem", padding: "0.4rem" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>
                    Unit
                  </label>
                  <select
                    className="form-input"
                    value={material.unit}
                    onChange={(e) =>
                      handleMaterialChange(index, "unit", e.target.value)
                    }
                    style={{ fontSize: "0.9rem", padding: "0.4rem" }}
                  >
                    <option value="Per Trip">Per Trip</option>
                    <option value="Per Ton">Per Ton</option>
                    <option value="Per Hour">Per Hour</option>
                    <option value="Per Cubic Meter">Per m³</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  style={{
                    padding: "0.4rem",
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    height: "36px",
                  }}
                  title="Remove Material"
                  disabled={materials.length === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMaterial}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "var(--background-color)",
              border: "1px dashed var(--primary-color)",
              color: "var(--primary-color)",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "500",
            }}
          >
            + Add Another Material & Route
          </button>
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "var(--secondary-color)",
              color: "white",
            }}
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Site Details
          </button>
        </div>
      </form>
    </div>
  );
}
