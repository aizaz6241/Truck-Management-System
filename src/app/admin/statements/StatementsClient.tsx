"use client";

import GenerateStatementModal from "@/components/statements/GenerateStatementModal";
import StatementList from "@/components/statements/StatementList";
import { useState } from "react";

interface Statement {
  id: number;
  name: string;
  type: string;
  date: Date;
  createdAt: Date;
}

import StatementTemplate from "@/components/statements/StatementTemplate";

export default function StatementsPageClient({
  statements,
  contractors,
}: {
  statements: Statement[];
  contractors: any[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="container" style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Statements</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Back to List" : "Preview Template"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Generate Statement
          </button>
        </div>
      </div>

      {showPreview ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#555",
            padding: "2rem",
            overflow: "auto",
          }}
        >
          <StatementTemplate />
        </div>
      ) : (
        <StatementList statements={statements} />
      )}

      <GenerateStatementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contractors={contractors}
      />
    </div>
  );
}
