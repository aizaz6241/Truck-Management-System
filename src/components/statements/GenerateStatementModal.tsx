"use client";

import { useState, useTransition, useEffect } from "react";
import { generateStatement, getContractorData } from "@/actions/statement";

interface GenerateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractors: any[];
}

export default function GenerateStatementModal({
  isOpen,
  onClose,
  contractors,
}: GenerateStatementModalProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [lpoNo, setLpoNo] = useState("");
  const [site, setSite] = useState("");
  const [letterhead, setLetterhead] = useState("RVT");

  // Data State
  const [allItems, setAllItems] = useState<any[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );
  const [loadingData, setLoadingData] = useState(false);

  // Fetch logic
  useEffect(() => {
    if (selectedContractorId) {
      setLoadingData(true);
      startTransition(async () => {
        const res = await getContractorData(parseInt(selectedContractorId));
        if (res.success && res.data) {
          // Merge and Sort
          const invoices = res.data.invoices.map((inv: any) => ({
            id: `inv-${inv.id}`,
            originalId: inv.id,
            type: "INVOICE",
            date: new Date(inv.date),
            description: inv.invoiceNo,
            amount: inv.totalAmount,
            contractorName: inv.contractor.name,
          }));

          const payments = res.data.payments.map((pay: any) => ({
            id: `pay-${pay.id}`,
            originalId: pay.id,
            type: "PAYMENT",
            date: new Date(pay.date),
            description: pay.chequeNo
              ? `Cheque #${pay.chequeNo}`
              : `Payment (${pay.type})`,
            amount: pay.amount,
            contractorName: pay.invoice.contractor.name,
          }));

          const merged = [...invoices, ...payments].sort(
            (a, b) => a.date.getTime() - b.date.getTime(),
          );
          setAllItems(merged);
          // Default select all? Or none? Let's select all by default for convenience
          setSelectedItemIds(new Set(merged.map((i) => i.id)));
        }
        setLoadingData(false);
      });
    } else {
      setAllItems([]);
    }
  }, [selectedContractorId]);

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItemIds(newSet);
  };

  const calculatePreview = () => {
    const selectedItems = allItems.filter((item) =>
      selectedItemIds.has(item.id),
    );
    let runningBalance = 0;
    return selectedItems.map((item) => {
      let credit = 0;
      let debit = 0;

      if (item.type === "INVOICE") {
        credit = item.amount;
        runningBalance += credit;
      } else {
        debit = item.amount;
        runningBalance -= debit; // Payment reduces balance (if balance = what they owe us)
        // Wait, "balance should be equal to balance - debit". Yes.
      }

      return {
        date: item.date.toLocaleDateString("en-GB"),
        description: item.description,
        credit,
        debit,
        balance: runningBalance,
        vehicle: "", // Invoices don't inherently have vehicle info in this summary view unless we fetch line items.
        // User asked: "selecting the invoice and then click generate... for the first invoice the total amount... added in credit..."
        // The detailed line items (vehicles) inside an invoice are not the rows here. The INVOICE itself is the row.
      };
    });
  };

  const handleGenerate = () => {
    const contractor = contractors.find(
      (c) => c.id.toString() === selectedContractorId,
    );
    if (!contractor) return;

    const finalItems = calculatePreview();

    const statementData = {
      contractorName: contractor.name,
      date: new Date().toLocaleDateString("en-GB"),
      lpoNo: lpoNo || "-",
      site: site || "-",
      items: finalItems,
    };

    startTransition(async () => {
      const res = await generateStatement({
        name: `Statement - ${contractor.name}`,
        type: "Statement of Account",
        details: JSON.stringify(statementData),
        date: new Date(),
        contractorId: contractor.id,
        letterhead,
      });

      if (res.success) {
        onClose();
        // Reset form
        setStep(1);
        setSelectedContractorId("");
      } else {
        alert("Failed to generate statement");
      }
    });
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
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          width: "90%",
          maxWidth: "800px", // Widen modal
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Generate Statement
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Select Contractor
            </label>
            <select
              className="form-input"
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- Select --</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              LPO No
            </label>
            <input
              className="form-input"
              value={lpoNo}
              onChange={(e) => setLpoNo(e.target.value)}
              placeholder="Optional"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Site / Project
            </label>
            <input
              className="form-input"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="Optional"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Letterhead
            </label>
            <select
              className="form-input"
              value={letterhead}
              onChange={(e) => setLetterhead(e.target.value)}
              style={{
                width: "100%",
                fontWeight: "bold",
                color: letterhead === "RVT" ? "blue" : "green",
              }}
            >
              <option value="RVT">RVT (Default)</option>
              <option value="GVT">GVT</option>
            </select>
          </div>
        </div>

        {loadingData && <div>Loading data...</div>}

        {allItems.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              Select Items
            </h3>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #eee",
                padding: "0.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  fontSize: "14px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <th style={{ padding: "4px" }}>
                      <input
                        type="checkbox"
                        checked={selectedItemIds.size === allItems.length}
                        onChange={() => {
                          if (selectedItemIds.size === allItems.length)
                            setSelectedItemIds(new Set());
                          else
                            setSelectedItemIds(
                              new Set(allItems.map((i) => i.id)),
                            );
                        }}
                      />
                    </th>
                    <th style={{ padding: "4px" }}>Date</th>
                    <th style={{ padding: "4px" }}>Type</th>
                    <th style={{ padding: "4px" }}>Description</th>
                    <th style={{ padding: "4px", textAlign: "right" }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #f9f9f9" }}
                    >
                      <td style={{ padding: "4px" }}>
                        <input
                          type="checkbox"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                      </td>
                      <td style={{ padding: "4px" }}>
                        {item.date.toLocaleDateString("en-GB")}
                      </td>
                      <td style={{ padding: "4px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            backgroundColor:
                              item.type === "INVOICE" ? "#e3f2fd" : "#e8f5e9",
                            color:
                              item.type === "INVOICE" ? "#1565c0" : "#2e7d32",
                          }}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: "4px" }}>{item.description}</td>
                      <td style={{ padding: "4px", textAlign: "right" }}>
                        {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{ marginTop: "0.5rem", fontSize: "12px", color: "gray" }}
            >
              Selected: {selectedItemIds.size} items
            </div>
          </div>
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
        >
          <button
            className="btn"
            onClick={onClose}
            disabled={isPending}
            style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isPending || selectedItemIds.size === 0}
          >
            {isPending ? "Generating..." : "Generate Statement"}
          </button>
        </div>
      </div>
    </div>
  );
}
