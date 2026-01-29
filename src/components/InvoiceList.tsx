"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import InvoiceGeneratorModal from "./InvoiceGeneratorModal";
import PaymentModal from "@/components/PaymentModal";
import PaymentHistoryModal from "@/components/PaymentHistoryModal";
import InvoiceReceptionModal from "./InvoiceReceptionModal";
import { deleteInvoice } from "@/actions/invoice";

interface Invoice {
  id: number;
  invoiceNo: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  contractor: {
    name: string;
    id: number;
  };
  material: string;
  paymentDate?: string;
  isReceived: boolean;
  receivedDate?: string;
  receivedCopyUrl?: string;
}

interface InvoiceListProps {
  initialInvoices: Invoice[]; // Flat list from server
  contractors: any[]; // For the modal
}

export default function InvoiceList({
  initialInvoices,
  contractors,
}: InvoiceListProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewHistoryInvoice, setViewHistoryInvoice] = useState<Invoice | null>(
    null,
  );
  const [receptionModalInvoice, setReceptionModalInvoice] =
    useState<Invoice | null>(null);

  // Filter State
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterContractorId, setFilterContractorId] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // New State
  const [filterReceived, setFilterReceived] = useState(""); // "Received", "Not Received"

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this invoice? Trips will be marked as uninvoiced.",
      )
    ) {
      const res = await deleteInvoice(id);
      if (!res.success) {
        alert("Failed to delete invoice");
      }
    }
  };

  // 1. Filter Logic
  const filteredInvoices = useMemo(() => {
    return initialInvoices.filter((inv) => {
      const d = new Date(inv.date);

      // Day
      if (filterDay && d.getDate().toString() !== filterDay) return false;

      // Month
      if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth)
        return false;

      // Year
      if (filterYear && d.getFullYear().toString() !== filterYear) return false;

      // Contractor
      if (
        filterContractorId &&
        inv.contractor.id.toString() !== filterContractorId
      )
        return false;

      // Material
      if (filterMaterial && inv.material !== filterMaterial) return false;

      // Status
      if (filterStatus && inv.status !== filterStatus) return false;

      // Received Status
      if (filterReceived) {
        if (filterReceived === "Received" && !inv.isReceived) return false;
        if (filterReceived === "Not Received" && inv.isReceived) return false;
      }

      return true;
    });
  }, [
    initialInvoices,
    filterDay,
    filterMonth,
    filterYear,
    filterContractorId,
    filterMaterial,
    filterStatus,
  ]);

  // 2. Grouping Logic: Year -> Month -> Contractor
  const groupedInvoices = useMemo(() => {
    return filteredInvoices.reduce((acc: any, invoice) => {
      const date = new Date(invoice.date);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });
      const contractor = invoice.contractor.name;

      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = {};
      if (!acc[year][month][contractor]) acc[year][month][contractor] = [];

      acc[year][month][contractor].push(invoice);
      return acc;
    }, {});
  }, [filteredInvoices]);

  // Sort Years Descending
  const sortedYears = Object.keys(groupedInvoices).sort(
    (a, b) => parseInt(b) - parseInt(a),
  );

  // Derived Options
  const availableYears = Array.from(
    new Set(initialInvoices.map((i) => new Date(i.date).getFullYear())),
  )
    .sort()
    .reverse();
  const availableMaterials = Array.from(
    new Set(initialInvoices.map((i) => i.material)),
  )
    .filter(Boolean)
    .sort();
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
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const resetFilters = () => {
    setFilterDay("");
    setFilterMonth("");
    setFilterYear("");
    setFilterContractorId("");
    setFilterMaterial("");
    setFilterStatus("");
    setFilterReceived("");
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "1200px", margin: "2rem auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1>Invoices</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Generate Invoice
        </button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "2rem",
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <select
          className="form-select"
          style={{ width: "auto" }}
          value={filterContractorId}
          onChange={(e) => setFilterContractorId(e.target.value)}
        >
          <option value="">All Contractors</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: "auto" }}
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value)}
        >
          <option value="">All Materials</option>
          {availableMaterials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: "auto" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        <select
          className="form-select"
          style={{ width: "auto" }}
          value={filterReceived}
          onChange={(e) => setFilterReceived(e.target.value)}
        >
          <option value="">All Reception Status</option>
          <option value="Received">Received</option>
          <option value="Not Received">Not Received</option>
        </select>

        <select
          className="form-select"
          style={{ width: "auto" }}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: "auto" }}
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
          style={{ width: "auto" }}
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
          style={{
            border: "1px solid #ccc",
            background: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      <InvoiceGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        contractors={contractors}
      />

      {receptionModalInvoice && (
        <InvoiceReceptionModal
          isOpen={!!receptionModalInvoice}
          onClose={() => setReceptionModalInvoice(null)}
          invoice={receptionModalInvoice}
        />
      )}

      {selectedInvoice && (
        <PaymentModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}

      {viewHistoryInvoice && (
        <PaymentHistoryModal
          isOpen={!!viewHistoryInvoice}
          onClose={() => setViewHistoryInvoice(null)}
          invoice={viewHistoryInvoice}
        />
      )}

      {filteredInvoices.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          No invoices found match filtering criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sortedYears.map((year) => (
            <div key={year} className="card">
              <h2
                style={{
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                {year}
              </h2>
              {Object.keys(groupedInvoices[year]).map((month) => (
                <div
                  key={month}
                  style={{ marginLeft: "1rem", marginTop: "1rem" }}
                >
                  <h3 style={{ color: "#555" }}>{month}</h3>
                  {Object.keys(groupedInvoices[year][month]).map(
                    (contractor) => (
                      <div
                        key={contractor}
                        style={{ marginLeft: "1rem", marginTop: "0.5rem" }}
                      >
                        <h4 style={{ color: "var(--primary-color)" }}>
                          {contractor}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          {groupedInvoices[year][month][contractor].map(
                            (inv: Invoice) => (
                              <div
                                key={inv.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "0.75rem",
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "4px",
                                  border: "1px solid #eee",
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: "bold" }}>
                                    {inv.invoiceNo}
                                  </span>
                                  <span
                                    style={{
                                      margin: "0 0.5rem",
                                      color: "#ccc",
                                    }}
                                  >
                                    |
                                  </span>
                                  <span>
                                    {new Date(inv.date).toLocaleDateString(
                                      "en-GB",
                                    )}
                                  </span>
                                  {inv.material &&
                                    inv.material !== "Unknown" && (
                                      <span
                                        style={{
                                          marginLeft: "10px",
                                          fontSize: "0.85em",
                                          color: "#666",
                                          backgroundColor: "#eee",
                                          padding: "2px 6px",
                                          borderRadius: "10px",
                                        }}
                                      >
                                        {inv.material}
                                      </span>
                                    )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "1rem",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-end",
                                    }}
                                  >
                                    <span style={{ fontWeight: "bold" }}>
                                      {inv.totalAmount.toLocaleString()}
                                    </span>
                                    {inv.paidAmount > 0 &&
                                      inv.paidAmount < inv.totalAmount && (
                                        <span
                                          style={{
                                            fontSize: "0.8rem",
                                            color: "#28a745",
                                          }}
                                        >
                                          Paid:{" "}
                                          {inv.paidAmount.toLocaleString()}
                                        </span>
                                      )}
                                  </div>

                                  <span
                                    style={{
                                      padding: "0.25rem 0.5rem",
                                      borderRadius: "4px",
                                      fontSize: "0.8rem",
                                      backgroundColor:
                                        inv.status === "Paid"
                                          ? "#d4edda"
                                          : inv.status === "Partial"
                                            ? "#cce5ff"
                                            : "#fff3cd",
                                      color:
                                        inv.status === "Paid"
                                          ? "#155724"
                                          : inv.status === "Partial"
                                            ? "#004085"
                                            : "#856404",
                                    }}
                                  >
                                    {inv.status}
                                  </span>

                                  {/* Received Toggle Button */}
                                  <button
                                    onClick={() =>
                                      setReceptionModalInvoice(inv)
                                    }
                                    style={{
                                      marginLeft: "10px",
                                      padding: "4px 10px",
                                      borderRadius: "4px",
                                      fontSize: "0.85rem",
                                      cursor: "pointer",
                                      border: "1px solid",
                                      backgroundColor: inv.isReceived
                                        ? "#e6fffa"
                                        : "#fff",
                                      borderColor: inv.isReceived
                                        ? "#38b2ac"
                                        : "#ccc",
                                      color: inv.isReceived
                                        ? "#2c7a7b"
                                        : "#666",
                                      fontWeight: inv.isReceived
                                        ? "bold"
                                        : "normal",
                                    }}
                                    title={
                                      inv.isReceived
                                        ? "View Received Copy"
                                        : "Mark as Received"
                                    }
                                  >
                                    {inv.isReceived
                                      ? "Received ✓"
                                      : "Mark Received"}
                                  </button>

                                  {/* View Payments Button */}
                                  {inv.paidAmount > 0 && (
                                    <button
                                      onClick={() => setViewHistoryInvoice(inv)}
                                      style={{
                                        border: "1px solid #17a2b8",
                                        backgroundColor: "white",
                                        color: "#17a2b8",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                      }}
                                      title="View Payment History"
                                    >
                                      History
                                    </button>
                                  )}

                                  {/* Payment Button */}
                                  {inv.status !== "Paid" && (
                                    <button
                                      onClick={() => setSelectedInvoice(inv)}
                                      style={{
                                        border: "1px solid #28a745",
                                        backgroundColor: "white",
                                        color: "#28a745",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Payment
                                    </button>
                                  )}
                                  <Link
                                    href={`/admin/invoices/${inv.id}`}
                                    style={{
                                      textDecoration: "underline",
                                      color: "blue",
                                    }}
                                  >
                                    View
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(inv.id)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "red",
                                      fontSize: "1.2rem",
                                      padding: "0 0.5rem",
                                    }}
                                    title="Delete Invoice"
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
