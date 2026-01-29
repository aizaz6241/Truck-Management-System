"use client";

import { useState } from "react";

// Actually, I'll create a simple self-contained modal since I don't know if they have shadcn/ui
// and I want to avoid massive dependency assumptions.

export default function DocumentViewer({
  documents,
}: {
  documents: { name: string; url: string; type: string | null }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{
    name: string;
    url: string;
    type: string | null;
  } | null>(null);

  if (!documents || documents.length === 0)
    return (
      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        0 Docs
      </span>
    );

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setSelectedDoc(documents[0]);
        }}
        style={{
          fontSize: "0.85rem",
          color: "var(--primary-color)",
          textDecoration: "underline",
          background: "none",
          border: "none",
          fontWeight: 500,
        }}
      >
        View {documents.length} Docs
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="card"
            style={{
              width: "90%",
              maxWidth: "800px",
              height: "80vh",
              display: "flex",
              flexDirection: "column",
              padding: "0",
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                Contractor Documents
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Sidebar list */}
              <div
                style={{
                  width: "200px",
                  borderRight: "1px solid var(--border-color)",
                  overflowY: "auto",
                  backgroundColor: "var(--background-color)",
                }}
              >
                {documents.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDoc(doc)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.75rem",
                      border: "none",
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor:
                        selectedDoc?.url === doc.url ? "white" : "transparent",
                      fontWeight:
                        selectedDoc?.url === doc.url ? "bold" : "normal",
                      color:
                        selectedDoc?.url === doc.url
                          ? "var(--primary-color)"
                          : "var(--text-primary)",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={doc.name}
                  >
                    {doc.name}
                  </button>
                ))}
              </div>

              {/* Preview Area */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                }}
              >
                {selectedDoc ? (
                  selectedDoc.name.toLowerCase().endsWith(".pdf") ||
                  selectedDoc.url.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={selectedDoc.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        backgroundColor: "white",
                      }}
                    />
                  ) : (
                    <img
                      src={selectedDoc.url}
                      alt={selectedDoc.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  )
                ) : (
                  <div>Select a document</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
