"use client";

import { useState } from "react";
import { updateTripPaperStatus } from "@/actions/trip";

export default function TripPaperStatus({
  id,
  initialStatus,
}: {
  id: number;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus || "Not Handed");
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = status === "Not Handed" ? "Received" : "Not Handed";

    // Optimistic update
    setStatus(newStatus);

    const res = await updateTripPaperStatus(id, newStatus);
    if (res.message !== "Status updated") {
      // Revert on failure
      setStatus(status);
      alert("Failed to update status");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      style={{
        padding: "0.25rem 0.5rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "600",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        backgroundColor: status === "Received" ? "#dcfce7" : "#fee2e2", // green-100 : red-100
        color: status === "Received" ? "#166534" : "#991b1b", // green-800 : red-800
        transition: "all 0.2s",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        opacity: loading ? 0.7 : 1,
      }}
      title="Click to toggle status"
    >
      <span
        style={{
          height: "8px",
          width: "8px",
          borderRadius: "50%",
          backgroundColor: status === "Received" ? "#22c55e" : "#ef4444", // green-500 : red-500
        }}
      />
      {status === "Received" ? "Received" : "Not Handed"}
    </button>
  );
}
