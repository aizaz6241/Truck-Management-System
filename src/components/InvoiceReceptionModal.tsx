"use client";

import { useState, useEffect } from "react";
// import { Dialog } from "@headlessui/react"; // Removing headless ui for reliability
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { UploadButton } from "@/utils/uploadthing";
import { markInvoiceAsReceived } from "@/actions/invoice";

interface InvoiceReceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

export default function InvoiceReceptionModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceReceptionModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already received, we show the view mode
  const isViewMode = invoice?.isReceived;

  // Reset state when invoice changes
  useEffect(() => {
    if (invoice?.receivedDate) {
      try {
        setDate(new Date(invoice.receivedDate).toISOString().split("T")[0]);
      } catch (e) {}
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      alert("Please upload a copy of the received invoice.");
      return;
    }

    setIsSubmitting(true);
    const res = await markInvoiceAsReceived(
      invoice.id,
      new Date(date),
      fileUrl,
    );

    if (res.success) {
      onClose();
    } else {
      alert("Failed to mark as received");
    }
    setIsSubmitting(false);
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
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          margin: "1rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #f3f4f6",
            backgroundColor: "#f9fafb",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            {isViewMode ? "Received Invoice" : "Mark as Received"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "0.25rem",
              display: "flex",
              borderRadius: "9999px",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#e5e7eb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <XMarkIcon style={{ height: "1.5rem", width: "1.5rem" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {/* Summary Card */}
          <div
            style={{
              backgroundColor: "#eef2ff",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              border: "1px solid #e0e7ff",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6366f1",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Invoice Number
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                {invoice?.invoiceNo}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#6366f1",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Total Amount
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Rs. {invoice?.totalAmount?.toLocaleString()}
              </p>
            </div>
          </div>

          {!isViewMode ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Date Received
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Scanned Copy
                </label>
                {!fileUrl ? (
                  <div
                    style={{
                      border: "2px dashed #d1d5db",
                      borderRadius: "0.75rem",
                      padding: "1.5rem",
                      backgroundColor: "#f9fafb",
                      textAlign: "center",
                    }}
                  >
                    <UploadButton
                      endpoint="contractUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setFileUrl(res[0].url);
                          setFileName(res[0].name);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                      appearance={{
                        button: {
                          backgroundColor: "#4f46e5",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        },
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginTop: "0.5rem",
                      }}
                    >
                      Supported: PDF, PNG, JPG (Max 8MB)
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem",
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "2.5rem",
                          width: "2.5rem",
                          borderRadius: "0.5rem",
                          backgroundColor: "#dcfce7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#16a34a",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.352 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.291a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.352 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 017.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#111827",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "180px",
                          }}
                        >
                          {fileName || "Uploaded File"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#16a34a" }}>
                          Ready to save
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileUrl("");
                        setFileName("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9ca3af",
                        cursor: "pointer",
                        padding: "0.25rem",
                      }}
                      title="Remove file"
                    >
                      <XMarkIcon
                        style={{ height: "1.25rem", width: "1.25rem" }}
                      />
                    </button>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  paddingTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    backgroundColor: "white",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !fileUrl}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    backgroundColor:
                      isSubmitting || !fileUrl ? "#a5b4fc" : "#4f46e5",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "white",
                    cursor:
                      isSubmitting || !fileUrl ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ height: "1rem", width: "1rem" }}
                      >
                        <circle
                          style={{ opacity: "0.25" }}
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          style={{ opacity: "0.75" }}
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Confirm & Save"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {invoice.receivedCopyUrl &&
                  (invoice.receivedCopyUrl.endsWith(".pdf") ? (
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                      📄
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div
                      style={{
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "white",
                        padding: "0.5rem",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <img
                        src={invoice.receivedCopyUrl}
                        alt="Invoice Copy"
                        style={{
                          maxHeight: "200px",
                          objectFit: "contain",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </div>
                  ))}
                <div style={{ marginTop: "1rem" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Marked as Received on
                  </p>
                  <p
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "700",
                      color: "#111827",
                      marginTop: "0.25rem",
                    }}
                  >
                    {invoice.receivedDate
                      ? new Date(invoice.receivedDate).toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "Unknown Date"}
                  </p>
                </div>
              </div>

              <a
                href={invoice.receivedCopyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  borderRadius: "0.75rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <ArrowDownTrayIcon
                  style={{ width: "1.25rem", height: "1.25rem" }}
                />
                Download Original Copy
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
