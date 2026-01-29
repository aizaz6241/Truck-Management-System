"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getContractorFilterOptions,
  getUninvoicedTrips,
  createInvoice,
} from "@/actions/invoice";
import {
  getContractorStatements,
  addInvoiceToStatement,
} from "@/actions/statement";
import { useRouter } from "next/navigation";

export default function NewInvoicePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Steps: 1. Select Contractor -> 2. Select Filter (Material/Route) -> 3. Select Trips -> 4. Confirm
  const [step, setStep] = useState(1);

  // Data
  const [contractors, setContractors] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    materials: string[];
    routes: string[];
  }>({ materials: [], routes: [] });
  const [trips, setTrips] = useState<any[]>([]);

  // New Data for Statement Flow
  const [statements, setStatements] = useState<any[]>([]);

  // Selections
  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedTripIds, setSelectedTripIds] = useState<Set<number>>(
    new Set(),
  );

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  // Modals functionality
  const [showAddToStatementModal, setShowAddToStatementModal] = useState(false);
  const [showStatementSelectionModal, setShowStatementSelectionModal] =
    useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string>("");

  // Fetch Contractors on Mount
  useEffect(() => {
    setMounted(true);
    async function loadContractors() {
      const res = await fetch("/api/contractors?status=Active");
      if (res.ok) {
        const data = await res.json();
        setContractors(data);
      }
    }
    loadContractors();
  }, []);

  // Step 1 -> 2
  const handleContractorSelect = async () => {
    if (!selectedContractorId) return;
    setIsPending(true);
    try {
      const options = await getContractorFilterOptions(
        parseInt(selectedContractorId),
      );
      setFilterOptions(options);
      setStep(2);
    } catch (e) {
      setError("Failed to load options");
    } finally {
      setIsPending(false);
    }
  };

  // ... (keeping Step 2, 3 logic unchanged)

  // Step 2 -> 3
  const handleFilterSelect = async () => {
    if (!selectedMaterial || !selectedRoute) return;
    setIsPending(true);
    try {
      const data = await getUninvoicedTrips(
        parseInt(selectedContractorId),
        selectedMaterial,
        selectedRoute,
      );
      setTrips(data);
      setStep(3);
    } catch (e) {
      setError("Failed to load trips");
    } finally {
      setIsPending(false);
    }
  };

  // Toggle Trip Selection
  const toggleTrip = (id: number) => {
    const newSet = new Set(selectedTripIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTripIds(newSet);
  };

  // Select All
  const toggleAll = () => {
    if (selectedTripIds.size === trips.length) {
      setSelectedTripIds(new Set());
    } else {
      setSelectedTripIds(new Set(trips.map((t) => t.id)));
    }
  };

  // Create Invoice
  const handleCreateInvoice = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (selectedTripIds.size === 0) return;
    setIsPending(true);
    try {
      const res = await createInvoice({
        contractorId: parseInt(selectedContractorId),
        tripIds: Array.from(selectedTripIds),
        materialName: selectedMaterial,
        route: selectedRoute,
      });

      if (res.success && res.invoiceId) {
        setCreatedInvoiceId(res.invoiceId);
        setShowAddToStatementModal(true);
      } else {
        const msg = res.message || "Failed to create invoice";
        setError(msg);
        alert(msg);
      }
    } catch (e: any) {
      console.error("Exception:", e);
      setError("Error creating invoice");
      alert("Error creating invoice");
    } finally {
      setIsPending(false);
    }
  };

  // Handle "Yes" on Add to Statement Verification
  const handleConfirmAddToStatement = async () => {
    setShowAddToStatementModal(false);
    setIsPending(true);
    try {
      const res = await getContractorStatements(parseInt(selectedContractorId));
      if (res.success && res.data && res.data.length > 0) {
        setStatements(res.data);
        setShowStatementSelectionModal(true);
      } else {
        alert("No statements found for this contractor.");
        router.push(`/admin/invoices/${createdInvoiceId}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch statements.");
      router.push(`/admin/invoices/${createdInvoiceId}`);
    } finally {
      setIsPending(false);
    }
  };

  // Handle "No" or Cancel
  const handleSkipAddToStatement = () => {
    setShowAddToStatementModal(false);
    setShowStatementSelectionModal(false);
    if (createdInvoiceId) {
      router.push(`/admin/invoices/${createdInvoiceId}`);
    }
  };

  // Handle Final Save to Statement
  const handleSaveToStatement = async () => {
    if (!selectedStatementId || !createdInvoiceId) return;
    setIsPending(true);
    try {
      const res = await addInvoiceToStatement(
        parseInt(selectedStatementId),
        createdInvoiceId,
      );
      if (res.success) {
        router.push(`/admin/invoices/${createdInvoiceId}`);
      } else {
        setError(res.error || "Failed to add to statement");
        alert(res.error || "Failed to add to statement");
      }
    } catch (e) {
      setError("Error adding to statement");
      alert("Error adding to statement");
    } finally {
      setIsPending(false);
    }
  };

  // Helper for Portal
  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    if (!mounted) return null;
    return createPortal(children, document.body);
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "800px", margin: "2rem auto", position: "relative" }}
    >
      <h1 style={{ marginBottom: "2rem" }}>Generate Invoice</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {step === 1 && (
        <div className="card">
          <h2>Step 1: Select Contractor</h2>
          <div className="form-group">
            <label className="form-label">Contractor</label>
            <select
              className="form-select"
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
          <button
            className="btn btn-primary"
            onClick={handleContractorSelect}
            disabled={!selectedContractorId || isPending}
          >
            {isPending ? "Loading..." : "Next"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <button
            onClick={() => setStep(1)}
            style={{
              marginBottom: "1rem",
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
            }}
          >
            &larr; Back
          </button>
          <h2>Step 2: Select Details</h2>
          <div className="form-group">
            <label className="form-label">Material</label>
            <select
              className="form-select"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
            >
              <option value="">Select Material</option>
              {filterOptions.materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Route</label>
            <select
              className="form-select"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="">Select Route</option>
              {filterOptions.routes.map((r) => {
                const [from, to] = r.split("|");
                return (
                  <option key={r} value={r}>
                    {from} &rarr; {to}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleFilterSelect}
            disabled={!selectedMaterial || !selectedRoute || isPending}
          >
            {isPending ? "Loading..." : "Find Trips"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <button
            onClick={() => setStep(2)}
            style={{
              marginBottom: "1rem",
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
            }}
          >
            &larr; Back
          </button>
          <h2>Step 3: Select Trips</h2>

          {trips.length === 0 ? (
            <p>No uninvoiced trips found for this criteria.</p>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTripIds.size === trips.length}
                    onChange={toggleAll}
                  />{" "}
                  Select All
                </label>
              </div>
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  border: "1px solid #eee",
                }}
              >
                <table className="table" style={{ width: "100%" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#fff",
                    }}
                  >
                    <tr>
                      <th>Select</th>
                      <th>Date</th>
                      <th>Vehicle</th>
                      <th>From</th>
                      <th>To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((trip) => (
                      <tr key={trip.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedTripIds.has(trip.id)}
                            onChange={() => toggleTrip(trip.id)}
                          />
                        </td>
                        <td>{new Date(trip.date).toLocaleDateString()}</td>
                        <td>{trip.vehicle?.number}</td>
                        <td>{trip.fromLocation}</td>
                        <td>{trip.toLocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <span style={{ marginRight: "1rem" }}>
                  <strong>{selectedTripIds.size}</strong> trips selected
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateInvoice}
                  disabled={selectedTripIds.size === 0 || isPending}
                >
                  {isPending ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal - Portal */}
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

      {/* Statement Selection Modal - Portal */}
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
                  disabled={!selectedStatementId || isPending}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    opacity: !selectedStatementId || isPending ? 0.5 : 1,
                  }}
                >
                  {isPending ? "Saving..." : "Save & Finish"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
