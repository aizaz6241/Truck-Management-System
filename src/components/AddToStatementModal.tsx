"use client";

import { useState, useEffect } from "react";
import {
  getContractorStatements,
  addPaymentToStatement,
} from "@/actions/statement";

interface AddToStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorId: number;
  paymentId: number;
  amount: number;
}

export default function AddToStatementModal({
  isOpen,
  onClose,
  contractorId,
  paymentId,
  amount,
}: AddToStatementModalProps) {
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatementId, setSelectedStatementId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && contractorId) {
      setLoading(true);
      getContractorStatements(contractorId).then((res) => {
        if (res.success && res.data) {
          setStatements(res.data);
          // Auto select if only one exists
          if (res.data.length > 0) {
            // @ts-ignore
            setSelectedStatementId(res.data[0].id.toString());
          }
        }
        setLoading(false);
      });
    }
  }, [isOpen, contractorId]);

  const handleAdd = async () => {
    if (!selectedStatementId) return;

    setSubmitting(true);
    try {
      const res = await addPaymentToStatement(
        parseInt(selectedStatementId),
        paymentId,
      );
      if (res.success) {
        alert("Payment added to statement successfully!");
        onClose();
      } else {
        alert(res.error || "Failed to add to statement");
      }
    } catch (e) {
      alert("Error adding to statement");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        zIndex: 1100, // Higher than existing modal
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Add Payment to Statement?</h2>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          The payment of <strong>{amount.toLocaleString()}</strong> has been
          recorded. Do you want to add this payment to a Statement of Account
          now?
        </p>

        {loading ? (
          <div>Loading statements...</div>
        ) : statements.length === 0 ? (
          <div style={{ color: "orange" }}>
            No statements found for this contractor.
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Select Statement</label>
            <select
              className="form-select"
              value={selectedStatementId}
              onChange={(e) => setSelectedStatementId(e.target.value)}
            >
              {statements.map((stmt) => (
                <option key={stmt.id} value={stmt.id}>
                  {stmt.name} ({new Date(stmt.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn"
            onClick={onClose}
            style={{ backgroundColor: "#ccc" }}
          >
            Skip / Close
          </button>

          {statements.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={submitting || !selectedStatementId}
            >
              {submitting ? "Adding..." : "Add to Statement"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
