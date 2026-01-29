"use client";

import { useEffect, useState } from "react";
import {
  getInvoicePayments,
  deletePayment,
  updatePayment,
} from "@/actions/invoice";
import { UploadButton } from "@/utils/uploadthing";

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

export default function PaymentHistoryModal({
  isOpen,
  onClose,
  invoice,
}: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    date: "",
    type: "",
    amount: "",
    chequeNo: "",
    bankName: "",
    note: "",
    chequeImageUrl: "",
  });

  const fetchPayments = () => {
    setLoading(true);
    getInvoicePayments(invoice.id).then((data) => {
      setPayments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isOpen && invoice) {
      fetchPayments();
    }
  }, [isOpen, invoice]);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this payment? This will update the invoice balance and remove it from any statements.",
      )
    )
      return;

    setIsProcessing(true);
    try {
      const res = await deletePayment(id);
      if (res.success) {
        fetchPayments();
      } else {
        alert(res.message || "Failed to delete payment");
      }
    } catch (e) {
      alert("Error deleting payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (payment: any) => {
    setEditingPayment(payment);
    setEditForm({
      date: new Date(payment.date).toISOString().split("T")[0],
      type: payment.type,
      amount: payment.amount.toString(),
      chequeNo: payment.chequeNo || "",
      bankName: payment.bankName || "",
      note: payment.note || "",
      chequeImageUrl: payment.chequeImageUrl || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPayment) return;
    setIsProcessing(true);
    try {
      const res = await updatePayment(editingPayment.id, {
        date: editForm.date,
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        chequeNo: editForm.chequeNo,
        bankName: editForm.bankName,
        note: editForm.note,
        chequeImageUrl: editForm.chequeImageUrl,
      });

      if (res.success) {
        setEditingPayment(null);
        fetchPayments();
      } else {
        alert(res.message || "Failed to update payment");
      }
    } catch (e) {
      alert("Error updating payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !invoice) return null;

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
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2>
            {editingPayment
              ? "Edit Payment"
              : `Payment History - ${invoice.invoiceNo}`}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {!editingPayment && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>Total:</strong> {invoice.totalAmount.toLocaleString()}
            </div>
            <div>
              <strong>Paid:</strong>{" "}
              {(invoice.paidAmount || 0).toLocaleString()}
            </div>
            <div style={{ color: "red" }}>
              <strong>Balance:</strong>{" "}
              {(
                invoice.totalAmount - (invoice.paidAmount || 0)
              ).toLocaleString()}
            </div>
          </div>
        )}

        {editingPayment ? (
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
              >
                <option value="Full Payment">Full Payment</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-input"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cheque No</label>
              <input
                type="text"
                className="form-input"
                value={editForm.chequeNo}
                onChange={(e) =>
                  setEditForm({ ...editForm, chequeNo: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                value={editForm.bankName}
                onChange={(e) =>
                  setEditForm({ ...editForm, bankName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea
                className="form-input"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cheque Photo</label>
              {editForm.chequeImageUrl ? (
                <div>
                  <img
                    src={editForm.chequeImageUrl}
                    alt="Cheque"
                    style={{ maxHeight: "150px", marginBottom: "10px" }}
                  />
                  <button
                    onClick={() =>
                      setEditForm({ ...editForm, chequeImageUrl: "" })
                    }
                    style={{ color: "red", display: "block" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0])
                      setEditForm({ ...editForm, chequeImageUrl: res[0].url });
                  }}
                />
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                className="btn"
                onClick={() => setEditingPayment(null)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={isProcessing}
              >
                {isProcessing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div>Loading payments...</div>
            ) : payments.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "2rem", color: "#666" }}
              >
                No payments recorded yet.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "10px" }}>Date</th>
                    <th style={{ padding: "10px" }}>Type</th>
                    <th style={{ padding: "10px" }}>Amount</th>
                    <th style={{ padding: "10px" }}>Cheque</th>
                    <th style={{ padding: "10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "10px" }}>
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "10px" }}>
                        {payment.type}
                        {payment.chequeNo && (
                          <div style={{ fontSize: "0.8em", color: "#666" }}>
                            #{payment.chequeNo}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px", fontWeight: "bold" }}>
                        {payment.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px" }}>
                        {payment.chequeImageUrl ? (
                          <a
                            href={payment.chequeImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "blue",
                              textDecoration: "underline",
                            }}
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <button
                          onClick={() => startEdit(payment)}
                          style={{
                            marginRight: "10px",
                            cursor: "pointer",
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          style={{
                            cursor: "pointer",
                            background: "red",
                            color: "white",
                            border: "none",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {!editingPayment && (
          <div style={{ marginTop: "2rem", textAlign: "right" }}>
            <button
              className="btn"
              onClick={onClose}
              style={{ backgroundColor: "#ccc" }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
