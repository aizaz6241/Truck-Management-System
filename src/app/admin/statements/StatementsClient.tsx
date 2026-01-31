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
  details?: string | null;
  contractorId?: number | null;
  site?: string;
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

  const [contractorFilter, setContractorFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Process statements to include site and contractor info if needed
  const processedStatements = statements.map((stmt) => {
    let site = "-";
    if (stmt.details) {
      try {
        const parsed = JSON.parse(stmt.details);
        if (parsed.site) site = parsed.site;
      } catch (e) {}
    }
    return { ...stmt, site };
  });

  const filteredStatements = processedStatements.filter((stmt) => {
    const sDate = new Date(stmt.date);

    const matchesContractor = contractorFilter
      ? stmt.contractorId?.toString() === contractorFilter
      : true;
    const matchesSite = siteFilter
      ? stmt.site.toLowerCase().includes(siteFilter.toLowerCase())
      : true;
    const matchesId = idFilter
      ? String(stmt.id).padStart(4, "0").includes(idFilter)
      : true;

    // Date Filters
    const matchesDate = dateFilter
      ? sDate.toISOString().split("T")[0] === dateFilter
      : true;
    const matchesMonth = monthFilter
      ? (sDate.getMonth() + 1).toString() === monthFilter
      : true;
    const matchesYear = yearFilter
      ? sDate.getFullYear().toString() === yearFilter
      : true;

    return (
      matchesContractor &&
      matchesSite &&
      matchesId &&
      matchesDate &&
      matchesMonth &&
      matchesYear
    );
  });

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

      {!showPreview && (
        <div
          className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          style={{
            marginBottom: "1.5rem",
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          }}
        >
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Contractor
              </label>
              <select
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={contractorFilter}
                onChange={(e) => setContractorFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              >
                <option value="">All Contractors</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Site
              </label>
              <input
                type="text"
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search site..."
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by ID
              </label>
              <input
                type="text"
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search ID (e.g. 0001)..."
                value={idFilter}
                onChange={(e) => setIdFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
            <div>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setContractorFilter("");
                  setSiteFilter("");
                  setIdFilter("");
                  setDateFilter("");
                  setMonthFilter("");
                  setYearFilter("");
                }}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  height: "42px",
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex gap-4 items-end mt-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Month
              </label>
              <select
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              >
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Year
              </label>
              <input
                type="number"
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Year (e.g. 2025)"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
          </div>
        </div>
      )}

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
        <StatementList statements={filteredStatements} />
      )}

      <GenerateStatementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contractors={contractors}
      />
    </div>
  );
}
