"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getAllUninvoicedTrips,
  createInvoice,
  getContractorFilterOptions,
  getContractorValidCombinations,
} from "@/actions/invoice";
import { useRouter } from "next/navigation";

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractors: any[];
}

import {
  getContractorStatements,
  addInvoiceToStatement,
} from "@/actions/statement";
import { createPortal } from "react-dom";

export default function InvoiceGeneratorModal({
  isOpen,
  onClose,
  contractors,
}: InvoiceGeneratorModalProps) {
  const router = useRouter();

  // Data State
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter State
  const [filterContractorId, setFilterContractorId] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterRoute, setFilterRoute] = useState(""); // "From|To"
  const [validCombinations, setValidCombinations] = useState<any[]>([]);
  const [letterhead, setLetterhead] = useState("RVT");

  // Modal State
  const [showAddToStatementModal, setShowAddToStatementModal] = useState(false);
  const [showStatementSelectionModal, setShowStatementSelectionModal] =
    useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [statements, setStatements] = useState<any[]>([]);
  const [selectedStatementId, setSelectedStatementId] = useState<string>("");
  const [isStatementPending, setIsStatementPending] = useState(false);

  // Selection
  const [selectedTripIds, setSelectedTripIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (isOpen) {
      loadTrips();
      setSelectedTripIds(new Set());
      setFilterContractorId("");
      setFilterMaterial("");
      setFilterRoute("");
      setValidCombinations([]);
      setError("");
      // Reset Statement Modal State
      setShowAddToStatementModal(false);
      setShowStatementSelectionModal(false);
      setCreatedInvoiceId(null);
      setStatements([]);
      setSelectedStatementId("");
    }
  }, [isOpen]);

  // Fetch valid combinations when contractor changes
  useEffect(() => {
    async function loadCombinations() {
      if (!filterContractorId) {
        setValidCombinations([]);
        return;
      }
      try {
        const combos = await getContractorValidCombinations(
          parseInt(filterContractorId),
        );
        setValidCombinations(combos);
      } catch (e) {
        console.error("Failed to load contractor combinations");
      }
    }
    loadCombinations();
  }, [filterContractorId]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await getAllUninvoicedTrips();
      setAllTrips(data);
    } catch (e) {
      setError("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredTrips = useMemo(() => {
    return allTrips.filter((trip) => {
      // 1. Contractor Match Filter (Strict)
      if (filterContractorId && validCombinations.length > 0) {
        // Check if this trip matches ANY valid combination for the contractor
        const matches = validCombinations.some(
          (combo) =>
            combo.material.trim() === trip.materialType.trim() &&
            combo.from.trim() === trip.fromLocation.trim() &&
            combo.to.trim() === trip.toLocation.trim(),
        );
        if (!matches) return false;
      } else if (filterContractorId && validCombinations.length === 0) {
        // Contractor selected but no valid pricing/sites found?
        // Should probably hide all trips or show none.
        // Let's hide all if contractor is selected but has no setup.
        return false;
      }

      // Material Filter
      if (filterMaterial && trip.materialType !== filterMaterial) return false;

      // Route Filter
      if (filterRoute) {
        const [f, t] = filterRoute.split("|");
        if (trip.fromLocation !== f || trip.toLocation !== t) return false;
      }

      return true;
    });
  }, [
    allTrips,
    filterMaterial,
    filterRoute,
    filterContractorId,
    validCombinations,
  ]);

  // Available Options based on FILTERED trips (or all? usually filtered)
  const availableMaterials = Array.from(
    new Set(
      (filterContractorId ? filteredTrips : allTrips).map(
        (t) => t.materialType,
      ),
    ),
  )
    .filter(Boolean)
    .sort();
  const availableRoutes = Array.from(
    new Set(
      (filterContractorId ? filteredTrips : allTrips).map(
        (t) => `${t.fromLocation}|${t.toLocation}`,
      ),
    ),
  ).sort();

  // Handling Selection
  const toggleTrip = (id: number) => {
    const newSet = new Set(selectedTripIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTripIds(newSet);
  };

  const toggleAllFiltered = () => {
    const allFilteredIds = filteredTrips.map((t) => t.id);
    const allSelected = allFilteredIds.every((id) => selectedTripIds.has(id));

    const newSet = new Set(selectedTripIds);
    if (allSelected) {
      allFilteredIds.forEach((id) => newSet.delete(id));
    } else {
      allFilteredIds.forEach((id) => newSet.add(id));
    }
    setSelectedTripIds(newSet);
  };

  const handleGenerate = async () => {
    if (selectedTripIds.size === 0) return;
    if (!filterContractorId) {
      alert("Please select a Contractor to bill these trips to.");
      return;
    }

    // We need to pass Material and Route to createInvoice so it can look up the price.
    // This validates that all selected trips match the criteria?
    // Or we pick the "Most common" or "First" and hope?
    // Let's enforce that if we are billing, we must settle on a Material/Route context
    // OR the system is smart enough.
    // The `createInvoice` function currently expects `materialName` and `route` to look up price.
    // If we select mix, it fails.
    // So we must REQUIRE the user to have Filtered by Material and Route OR verify uniformity.

    // Check uniformity
    const selectedTrips = allTrips.filter((t) => selectedTripIds.has(t.id));
    const firstMaterial = selectedTrips[0]?.materialType;
    const firstRoute = `${selectedTrips[0]?.fromLocation}|${selectedTrips[0]?.toLocation}`;

    const isUniform = selectedTrips.every(
      (t) =>
        t.materialType === firstMaterial &&
        `${t.fromLocation}|${t.toLocation}` === firstRoute,
    );

    if (!isUniform) {
      alert(
        "All selected trips must have the same Material and Route to generate a single invoice.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await createInvoice({
        contractorId: parseInt(filterContractorId),
        tripIds: Array.from(selectedTripIds),
        materialName: firstMaterial,
        route: firstRoute,
        letterhead,
      });

      if (res.success && res.invoiceId) {
        setCreatedInvoiceId(res.invoiceId);
        setLoading(false);
        // INSTEAD of closing and redirecting, show the statement modal
        // onClose();
        // router.push(`/admin/invoices/${res.invoiceId}`);
        setShowAddToStatementModal(true);
      } else {
        const msg = res.message || "Failed to create invoice";
        setError(msg);
        alert(msg); // Ensure user sees the error
        setLoading(false);
      }
    } catch (e) {
      setError("Error creating invoice");
      setLoading(false);
    }
  };

  // Statement Handlers
  const handleConfirmAddToStatement = async () => {
    setShowAddToStatementModal(false);
    setIsStatementPending(true);
    try {
      if (!filterContractorId) return;
      const res = await getContractorStatements(parseInt(filterContractorId));
      if (res.success && res.data && res.data.length > 0) {
        // Filter by matching letterhead
        const filtered = res.data.filter(
          (s: any) => (s.letterhead || "RVT") === letterhead,
        );

        if (filtered.length > 0) {
          setStatements(filtered);
          setShowStatementSelectionModal(true);
        } else {
          alert(`No valid statements found with letterhead: ${letterhead}`);
          onClose();
          if (createdInvoiceId)
            router.push(`/admin/invoices/${createdInvoiceId}`);
        }
      } else {
        alert("No statements found for this contractor.");
        onClose();
        if (createdInvoiceId)
          router.push(`/admin/invoices/${createdInvoiceId}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch statements.");
      onClose();
      if (createdInvoiceId) router.push(`/admin/invoices/${createdInvoiceId}`);
    } finally {
      setIsStatementPending(false);
    }
  };

  const handleSkipAddToStatement = () => {
    setShowAddToStatementModal(false);
    setShowStatementSelectionModal(false);
    onClose();
    if (createdInvoiceId) {
      router.push(`/admin/invoices/${createdInvoiceId}`);
    }
  };

  const handleSaveToStatement = async () => {
    if (!selectedStatementId || !createdInvoiceId) return;
    setIsStatementPending(true);
    try {
      const res = await addInvoiceToStatement(
        parseInt(selectedStatementId),
        createdInvoiceId,
      );
      if (res.success) {
        onClose();
        router.push(`/admin/invoices/${createdInvoiceId}`);
      } else {
        alert(res.error || "Failed to add to statement");
      }
    } catch (e) {
      alert("Error adding to statement");
    } finally {
      setIsStatementPending(false);
    }
  };

  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    return createPortal(children, document.body);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            width: "95vw",
            height: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2>Generate Invoice</h2>
            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          )}

          {/* Filters Bar */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              flexWrap: "wrap",
              alignItems: "end",
            }}
          >
            <div
              className="form-group"
              style={{ marginBottom: 0, flex: 1, minWidth: "200px" }}
            >
              <label className="form-label">Bill To (Contractor)</label>
              <select
                className="form-select"
                value={filterContractorId}
                onChange={(e) => setFilterContractorId(e.target.value)}
              >
                <option value="">Select Contractor...</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="form-group"
              style={{ marginBottom: 0, flex: 1, minWidth: "150px" }}
            >
              <label className="form-label">Filter Material</label>
              <select
                className="form-select"
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
              >
                <option value="">All Materials</option>
                {availableMaterials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="form-group"
              style={{ marginBottom: 0, flex: 1, minWidth: "200px" }}
            >
              <label className="form-label">Filter Route</label>
              <select
                className="form-select"
                value={filterRoute}
                onChange={(e) => setFilterRoute(e.target.value)}
              >
                <option value="">All Routes</option>
                {availableRoutes.map((r) => {
                  const [from, to] = r.split("|");
                  return (
                    <option key={r} value={r}>
                      {from} &rarr; {to}
                    </option>
                  );
                })}
              </select>
            </div>

            <div
              className="form-group"
              style={{ marginBottom: 0, flex: 1, minWidth: "150px" }}
            >
              <label className="form-label">Letterhead</label>
              <select
                className="form-select"
                value={letterhead}
                onChange={(e) => setLetterhead(e.target.value)}
                style={{
                  fontWeight: "bold",
                  color: letterhead === "RVT" ? "blue" : "green",
                }}
              >
                <option value="RVT">RVT (Default)</option>
                <option value="GVT">GVT</option>
              </select>
            </div>
          </div>

          {/* Table Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #eee",
              position: "relative",
            }}
          >
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Loading trips...
              </div>
            ) : (
              <table
                className="table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#fff",
                    zIndex: 1,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <tr>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      <input
                        type="checkbox"
                        onChange={toggleAllFiltered}
                        checked={
                          filteredTrips.length > 0 &&
                          filteredTrips.every((t) => selectedTripIds.has(t.id))
                        }
                      />
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Date
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Vehicle
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Driver
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Material
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Route
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: "1rem", textAlign: "center" }}
                      >
                        No trips found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          backgroundColor: selectedTripIds.has(trip.id)
                            ? "#e3f2fd"
                            : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.75rem" }}>
                          <input
                            type="checkbox"
                            checked={selectedTripIds.has(trip.id)}
                            onChange={() => toggleTrip(trip.id)}
                          />
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          {new Date(trip.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          {trip.vehicle?.number}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          {trip.driver?.name}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          {trip.materialType}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          {trip.fromLocation} &rarr; {trip.toLocation}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer / Actions */}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #eee",
              paddingTop: "1rem",
            }}
          >
            <div style={{ color: "#666" }}>
              Selected: <strong>{selectedTripIds.size}</strong> trips
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                className="btn"
                onClick={onClose}
                style={{ backgroundColor: "#f0f0f0", color: "#333" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={selectedTripIds.size === 0 || loading}
              >
                {loading ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showAddToStatementModal && (
        <ModalPortal>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3>Invoice Generated!</h3>
              <p>Do you want to add this invoice to a statement now?</p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  onClick={handleSkipAddToStatement}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #ccc",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  No
                </button>
                <button
                  onClick={handleConfirmAddToStatement}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "blue",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Statement Selection Modal */}
      {showStatementSelectionModal && (
        <ModalPortal>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3>Select Statement</h3>
              <p>Select which statement to add this invoice to:</p>

              <div style={{ margin: "1rem 0" }}>
                <select
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  value={selectedStatementId}
                  onChange={(e) => setSelectedStatementId(e.target.value)}
                >
                  <option value="">-- Select Statement --</option>
                  {statements.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {new Date(s.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  onClick={handleSkipAddToStatement}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #ccc",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToStatement}
                  disabled={!selectedStatementId || isStatementPending}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    opacity:
                      !selectedStatementId || isStatementPending ? 0.5 : 1,
                  }}
                >
                  {isStatementPending ? "Saving..." : "Save & Finish"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
