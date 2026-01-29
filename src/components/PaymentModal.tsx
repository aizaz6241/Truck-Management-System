"use client";

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { recordPayment } from "@/actions/invoice";

import AddToStatementModal from "./AddToStatementModal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

export default function PaymentModal({
  isOpen,
  onClose,
  invoice,
}: PaymentModalProps) {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentType, setPaymentType] = useState("Full Payment");
  const [amount, setAmount] = useState("");
  const [chequeImageUrl, setChequeImageUrl] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    paymentId: number;
    amount: number;
  } | null>(null);

  if (!isOpen || !invoice) return null;

  const totalAmount = invoice.totalAmount;
  const paidAmount = invoice.paidAmount || 0;
  const remainingBalance = totalAmount - paidAmount;

  // Derived amount to send
  const amountToSend =
    paymentType === "Full Payment" ? remainingBalance : parseFloat(amount);

  const handleSubmit = async () => {
    setIsPending(true);
    try {
      const res = await recordPayment(invoice.id, {
        paymentDate: new Date(paymentDate),
        paymentType,
        amount: amountToSend,
        chequeImageUrl,
        chequeNo,
        bankName,
      });

      if (res.success && res.paymentId) {
        // Trigger next modal
        setPaymentSuccess({ paymentId: res.paymentId, amount: amountToSend });
      } else if (res.success) {
        // Fallback if no ID returned (shouldnt happen with my fix)
        onClose();
      } else {
        alert(res.message || "Failed to record payment");
      }
    } catch (e) {
      alert("Error recording payment");
    } finally {
      setIsPending(false);
    }
  };

  const handleFinalClose = () => {
    setPaymentSuccess(null);
    onClose();
  };

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
            padding: "2rem",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "500px",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>
            Record Payment for {invoice.invoiceNo}
          </h2>

          <div
            style={{
              marginBottom: "1rem",
              padding: "10px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
            }}
          >
            <div>
              <strong>Total Amount:</strong> {totalAmount.toLocaleString()}
            </div>
            <div>
              <strong>Paid So Far:</strong> {paidAmount.toLocaleString()}
            </div>
            <div style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
              <strong>Remaining:</strong> {remainingBalance.toLocaleString()}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input
              type="date"
              className="form-input"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <select
              className="form-select"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="Full Payment">
                Full Payment ({remainingBalance.toLocaleString()})
              </option>
              <option value="Partial">Partial Payment</option>
            </select>
          </div>

          {paymentType === "Partial" && (
            <div className="form-group">
              <label className="form-label">Amount Received</label>
              <input
                type="number"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max: ${remainingBalance}`}
                max={remainingBalance}
              />
              {amount && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "5px",
                    color: "#666",
                  }}
                >
                  Remaining after this:{" "}
                  {(
                    remainingBalance - parseFloat(amount || "0")
                  ).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Cheque No (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={chequeNo}
              onChange={(e) => setChequeNo(e.target.value)}
              placeholder="e.g. 123456"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bank Name (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Dubai Islamic Bank"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cheque Photo (Optional)</label>
            {chequeImageUrl ? (
              <div style={{ marginBottom: "1rem" }}>
                <img
                  src={chequeImageUrl}
                  alt="Cheque"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "4px",
                  }}
                />
                <button
                  onClick={() => setChequeImageUrl("")}
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                    color: "red",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setChequeImageUrl(res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
            )}
          </div>

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
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={
                isPending ||
                (paymentType === "Partial" &&
                  (!amount ||
                    parseFloat(amount) <= 0 ||
                    parseFloat(amount) > remainingBalance))
              }
            >
              {isPending ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>

      {paymentSuccess && (
        <AddToStatementModal
          isOpen={true}
          onClose={handleFinalClose}
          contractorId={invoice.contractor.id}
          paymentId={paymentSuccess.paymentId}
          amount={paymentSuccess.amount}
        />
      )}
    </>
  );
}
