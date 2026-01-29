"use client";

import React from "react";

export default function PrintButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      style={{
        padding: "0.5rem 1rem",
        cursor: "pointer",
        backgroundColor: "#333",
        color: "white",
        border: "none",
        borderRadius: "4px",
      }}
    >
      Print / Save as PDF (Ctrl + P)
    </button>
  );
}
