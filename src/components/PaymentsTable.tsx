"use client";

import { useState } from "react";

interface Payment {
  id: number;
  date: string; // ISO string
  amount: number;
  type: string;
  chequeImageUrl: string | null;
  chequeNo: string | null;
  invoice: {
    id: number;
    invoiceNo: string;
    totalAmount: number;
    paidAmount: number;
    contractor: {
      name: string;
    };
    trips: {
      materialType?: string;
    }[];
  };
}

interface PaymentsTableProps {
  initialPayments: Payment[];
}

export default function PaymentsTable({ initialPayments }: PaymentsTableProps) {
  const [selectedCheque, setSelectedCheque] = useState<string | null>(null);

  // Filter States
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterContractor, setFilterContractor] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterInvoiceNo, setFilterInvoiceNo] = useState("");

  // Sort State
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Derived Options for Dropdowns
  const uniqueContractors = Array.from(
    new Set(initialPayments.map((p) => p.invoice.contractor.name)),
  ).sort();
  const uniqueMaterials = Array.from(
    new Set(
      initialPayments.map((p) => p.invoice.trips[0]?.materialType || "Unknown"),
    ),
  ).sort();
  const uniqueYears = Array.from(
    new Set(initialPayments.map((p) => new Date(p.date).getFullYear())),
  )
    .sort()
    .reverse();
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    { num: "1", name: "January" },
    { num: "2", name: "February" },
    { num: "3", name: "March" },
    { num: "4", name: "April" },
    { num: "5", name: "May" },
    { num: "6", name: "June" },
    { num: "7", name: "July" },
    { num: "8", name: "August" },
    { num: "9", name: "September" },
    { num: "10", name: "October" },
    { num: "11", name: "November" },
    { num: "12", name: "December" },
  ];

  // Filtering Logic
  const filteredPayments = initialPayments.filter((p) => {
    const d = new Date(p.date);
    if (filterDay && d.getDate().toString() !== filterDay) return false;
    if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth)
      return false;
    if (filterYear && d.getFullYear().toString() !== filterYear) return false;
    if (filterContractor && p.invoice.contractor.name !== filterContractor)
      return false;
    const mat = p.invoice.trips[0]?.materialType || "Unknown";
    if (filterMaterial && mat !== filterMaterial) return false;
    if (
      filterInvoiceNo &&
      !p.invoice.invoiceNo.toLowerCase().includes(filterInvoiceNo.toLowerCase())
    )
      return false;
    return true;
  });

  // Sorting Logic
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortKey) return 0;

    let valA: any, valB: any;

    if (sortKey === "contractor") {
      valA = a.invoice.contractor.name;
      valB = b.invoice.contractor.name;
    } else if (sortKey === "ta") {
      valA = a.invoice.totalAmount;
      valB = b.invoice.totalAmount;
    } else if (sortKey === "ra") {
      valA = a.amount;
      valB = b.amount;
    } else if (sortKey === "dif") {
      valA = a.invoice.totalAmount - (a.invoice.paidAmount || 0);
      valB = b.invoice.totalAmount - (b.invoice.paidAmount || 0);
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const resetFilters = () => {
    setFilterDay("");
    setFilterMonth("");
    setFilterYear("");
    setFilterContractor("");
    setFilterMaterial("");
    setFilterInvoiceNo("");
    setSortKey(null);
  };

  return (
    <div className="card">
      {selectedCheque && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setSelectedCheque(null)}
        >
          <img
            src={selectedCheque}
            alt="Cheque"
            style={{ maxWidth: "90%", maxHeight: "90vh" }}
          />
        </div>
      )}

      {/* Filters Bar */}
      <div
        className="filter-bar"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search Invoice No"
          className="form-input"
          style={{ flex: 1, minWidth: "150px", padding: "6px" }}
          value={filterInvoiceNo}
          onChange={(e) => setFilterInvoiceNo(e.target.value)}
        />

        <select
          className="form-select"
          style={{ flex: 1, minWidth: "150px" }}
          value={filterContractor}
          onChange={(e) => setFilterContractor(e.target.value)}
        >
          <option value="">All Contractors</option>
          {uniqueContractors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ flex: 1, minWidth: "150px" }}
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value)}
        >
          <option value="">All Materials</option>
          {uniqueMaterials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ flex: 1, minWidth: "120px" }}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {uniqueYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ flex: 1, minWidth: "120px" }}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {months.map((m) => (
            <option key={m.num} value={m.num}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ flex: 1, minWidth: "100px" }}
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
        >
          <option value="">All Days</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="btn"
          style={{
            border: "1px solid #ccc",
            background: "white",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Reset
        </button>
      </div>

      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "1000px",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
              <th
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSort("contractor")}
              >
                Contractor{" "}
                <span style={{ fontSize: "0.8em", color: "#888" }}>
                  {getSortIcon("contractor")}
                </span>
              </th>
              <th style={{ padding: "12px" }}>Material</th>
              <th style={{ padding: "12px" }}>Invoice No</th>
              <th style={{ padding: "12px" }}>Date Received</th>
              <th
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSort("ta")}
              >
                TA{" "}
                <span style={{ fontSize: "0.8em", color: "#888" }}>
                  {getSortIcon("ta")}
                </span>
              </th>
              <th
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSort("ra")}
              >
                RA{" "}
                <span style={{ fontSize: "0.8em", color: "#888" }}>
                  {getSortIcon("ra")}
                </span>
              </th>
              <th
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSort("dif")}
              >
                Dif{" "}
                <span style={{ fontSize: "0.8em", color: "#888" }}>
                  {getSortIcon("dif")}
                </span>
              </th>
              <th style={{ padding: "12px" }}>Cheque No</th>
              <th style={{ padding: "12px" }}>Cheque</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  No payments records found.
                </td>
              </tr>
            ) : (
              sortedPayments.map((payment) => {
                const invoice = payment.invoice;
                const material = invoice.trips[0]?.materialType || "Unknown";
                const remaining =
                  invoice.totalAmount - (invoice.paidAmount || 0);

                return (
                  <tr
                    key={payment.id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "12px" }}>
                      {invoice.contractor.name}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          backgroundColor: "#f0f0f0",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.85em",
                          color: "#666",
                        }}
                      >
                        {material}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {invoice.invoiceNo}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(payment.date).toLocaleDateString("en-GB")}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {invoice.totalAmount.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      {payment.amount.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: remaining > 0 ? "red" : "green",
                      }}
                    >
                      {remaining.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {payment.chequeNo || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {payment.chequeImageUrl ? (
                        <button
                          onClick={() =>
                            setSelectedCheque(payment.chequeImageUrl)
                          }
                          style={{
                            border: "1px solid #007bff",
                            backgroundColor: "#fff",
                            color: "#007bff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          View Photo
                        </button>
                      ) : (
                        <span style={{ color: "#ccc" }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
