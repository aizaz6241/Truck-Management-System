"use client";

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { createContractor, updateContractor } from "@/lib/actions/contractor";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";
import {
  Contractor,
  ContractorDocument,
  ContractorMaterial,
} from "../types/prisma";

interface ContractorFormProps {
  initialData?: Contractor & {
    documents: ContractorDocument[];
    materials?: ContractorMaterial[];
  };
}

export default function ContractorForm({ initialData }: ContractorFormProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  // Initialize documents with existing ones if available.
  // We need to be careful: existing docs have full structure, new ones just name/url.
  const [documents, setDocuments] = useState<
    (ContractorDocument | { name: string; url: string; type?: string })[]
  >(initialData?.documents || []);

  // Initialize materials
  const [materials, setMaterials] = useState<string[]>(
    initialData?.materials?.map((m) => m.name) || [],
  );
  const [newMaterial, setNewMaterial] = useState("");

  const [error, setError] = useState("");

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setMaterials([...materials, newMaterial.trim()]);
      setNewMaterial("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMaterial();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startLoading();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    if (!name || !phone) {
      setError("Name and Phone are required.");
      stopLoading();
      return;
    }

    try {
      let result;

      // Filter out ONLY new documents to send to the server action for creation
      // New documents won't have an 'id' property (if they come from UploadThing response mapped directly).
      // Existing documents have 'id'.
      // The updateContractor action (as written in previous step) expects a list of objects to CREATE.
      const newDocuments = documents.filter((doc) => !("id" in doc)) as {
        name: string;
        url: string;
        type?: string;
      }[];

      if (initialData) {
        result = await updateContractor(
          initialData.id,
          formData,
          newDocuments,
          materials,
        );
      } else {
        // For create, we send all documents (they are all new)
        // We need to make sure we pass the right structure.
        // The cast above for 'newDocuments' works for create too if documents only has new stuff.
        // But let's be safe.
        const allDocs = documents as {
          name: string;
          url: string;
          type?: string;
        }[];
        result = await createContractor(formData, allDocs, materials);
      }

      if (result.success) {
        router.push("/admin/contractors");
        router.refresh();
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to save contractor");
    } finally {
      stopLoading();
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
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
        {initialData ? "Edit Contractor" : "Add New Contractor"}
      </h2>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Contractor Name *</label>
            <input
              name="name"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Acme Logistics"
              defaultValue={initialData?.name}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Abbreviation *</label>
            <input
              name="abbreviation"
              type="text"
              className="form-input"
              required
              placeholder="e.g. AL"
              defaultValue={initialData?.abbreviation || ""}
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              name="phone"
              type="text"
              className="form-input"
              required
              placeholder="e.g. +92 300 1234567"
              defaultValue={initialData?.phone}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. info@acme.com"
              defaultValue={initialData?.email || ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              name="address"
              type="text"
              className="form-input"
              placeholder="Office Address"
              defaultValue={initialData?.address || ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PO Box</label>
            <input
              name="poBox"
              type="text"
              className="form-input"
              placeholder="e.g. 12345, Dubai"
              defaultValue={initialData?.poBox || ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">License Number</label>
            <input
              name="licenseNumber"
              type="text"
              className="form-input"
              placeholder="License / Registration No."
              defaultValue={initialData?.licenseNumber || ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">TRN Number</label>
            <input
              name="taxId"
              type="text"
              className="form-input"
              placeholder="TRN Number"
              defaultValue={initialData?.taxId || ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contract Start Date</label>
            <input
              name="contractStartDate"
              type="date"
              className="form-input"
              defaultValue={
                initialData?.contractStartDate
                  ? new Date(initialData.contractStartDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contract End Date</label>
            <input
              name="contractEndDate"
              type="date"
              className="form-input"
              defaultValue={
                initialData?.contractEndDate
                  ? new Date(initialData.contractEndDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
            />
          </div>
        </div>

        {/* Materials Section */}
        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label className="form-label">Contractor Materials</label>
          <div
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Add material (e.g. Sand, Gravel)"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={handleAddMaterial}
              className="btn btn-secondary"
              style={{ whiteSpace: "nowrap" }}
            >
              Add Material
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {materials.map((mat, idx) => (
              <span
                key={idx}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "var(--background-color)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {mat}
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(idx)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label className="form-label">Contract Documents (PDFs/Images)</label>
          <div
            style={{
              border: "2px dashed var(--border-color)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <UploadButton
              endpoint="contractUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  const newDocs = res.map((file) => ({
                    name: file.name,
                    url: file.url,
                    type: "Contract", // Default type
                  }));
                  setDocuments((prev) => [...prev, ...newDocs]);
                  // alert("Upload Completed");
                }
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          </div>

          {documents.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h4
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Uploaded Files:
              </h4>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem",
                      backgroundColor: "var(--background-color)",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--primary-color)",
                        textDecoration: "underline",
                        fontSize: "0.9rem",
                      }}
                    >
                      {doc.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocument(idx)}
                      style={{
                        color: "var(--danger-color)",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {initialData ? "Update Contractor" : "Save Contractor"}
          </button>
        </div>
      </form>
    </div>
  );
}
