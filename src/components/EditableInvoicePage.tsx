"use client";

import { useState, useRef } from "react";
import { updateInvoiceMetadata } from "@/actions/invoice";
import { numberToWords } from "@/utils/numberToWords";
import PrintButton from "@/components/PrintButton";

interface EditableInvoicePageProps {
  invoice: any;
  initialLineItems: any[];
}

export default function EditableInvoicePage({
  invoice,
  initialLineItems,
}: EditableInvoicePageProps) {
  // Check if invoice has stored metadata, otherwise use initial aggregation
  const storedMetadata = invoice.metadata ? JSON.parse(invoice.metadata) : null;

  // Initial "To" details from invoice/contractor
  const initialToDetails = storedMetadata?.toDetails || {
    name: invoice.contractor.name,
    address: invoice.contractor.address || "",
    poBox: (invoice.contractor as any).poBox || "",
    trn: (invoice.contractor as any).taxId || "",
    license: invoice.contractor.licenseNumber || "",
    lpo: (invoice.contractor as any).lpo || "", // LPO isn't in contractor model, so empty default
    project: (invoice.contractor as any).project || "", // Project isn't in contractor model either
  };

  // Initial "From" details (Defaults)
  const initialFromDetails = storedMetadata?.fromDetails || {
    companyName: "RAZMAK VISION TRANSPORT",
    office: "303 # 3RD FLOOR EMIVEST BUILDING AL QOUZ-3",
    poBox: "19383, DUBAI",
    invoiceLabel: "INVOICE",
    dateLabel: "DATE",
    trnLabel: "TRN No",
    trnValue: "100257853000003",
    emailLabel: "EMAIL",
    emailValue: "gulfihsan@gmail.com",
    mobileLabel: "MOBILE",
    mobileValue: "055 4494480",
  };

  // State initialization
  const [lineItems, setLineItems] = useState<any[]>(
    storedMetadata?.lineItems || initialLineItems,
  );

  const [toDetails, setToDetails] = useState(initialToDetails);
  const [fromDetails, setFromDetails] = useState(initialFromDetails);
  const [saving, setSaving] = useState(false);

  // Derived Totals
  const vatRate = 0.05;

  // Calculate totals on the fly
  const calculateTotals = () => {
    let subTotal = 0;
    lineItems.forEach((item) => {
      // Ensure numbers
      const price = parseFloat(item.price) || 0;
      const qty = parseFloat(item.quantity) || 0;
      subTotal += price * qty;
    });
    const vatAmount = subTotal * vatRate;
    const grossAmount = subTotal + vatAmount;
    return { subTotal, vatAmount, grossAmount };
  };

  const { subTotal, vatAmount, grossAmount } = calculateTotals();

  const handleToChange = (field: string, value: string) => {
    setToDetails((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFromChange = (field: string, value: string) => {
    setFromDetails((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total for row (visually) if we want to store it OR just rely on render
    // Actually, let's keep 'total' in valid state
    const price = parseFloat(newItems[index].price) || 0;
    const qty = parseFloat(newItems[index].quantity) || 0;
    newItems[index].total = price * qty;

    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", unit: "", quantity: 0, price: 0, total: 0 },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    const newItems = [...lineItems];
    newItems.splice(index, 1);
    setLineItems(newItems);
  };

  const handleSave = async (andPrint = false) => {
    setSaving(true);
    try {
      const metadata = JSON.stringify({
        lineItems,
        toDetails,
        fromDetails,
      });
      // Pass grossAmount to update the DB record for correct listing
      const res = await updateInvoiceMetadata(
        invoice.id,
        metadata,
        grossAmount,
      );
      if (res.success) {
        if (andPrint) {
          setTimeout(() => window.print(), 100);
        } else {
          alert("Invoice Saved Successfully");
        }
      } else {
        alert("Failed to save: " + res.message);
      }
    } catch (e) {
      alert("Error saving invoice");
    } finally {
      setSaving(false);
    }
  };

  const dateStr = new Date(invoice.date).toLocaleDateString("en-GB");
  const monthAbbr = new Date(invoice.date)
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const yearFull = new Date(invoice.date).getFullYear();

  // Auto-resize textarea helper
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  return (
    <div
      className="invoice-container"
      style={{
        maxWidth: "210mm",
        margin: "0 auto",
        backgroundColor: "white",
        minHeight: "297mm", // A4
        padding: "10mm",
        paddingTop: "50mm",
        paddingBottom: "0mm",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        position: "relative",
        backgroundImage: `url('/${invoice.letterhead || "RVT"}_Letterhead.png')`,
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
              @page { size: A4; margin: 0; }
              
              /* 1. Hide global elements strictly */
              body * {
                  visibility: hidden;
              }
              
              /* 2. Target specific layout parents to remove their "Ghost" dimensions */
              .admin-shell, .admin-main {
                  display: block !important; /* Keep them rendered so children appear */
                  visibility: visible !important; /* Need to see children */
                  position: static !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  min-height: 0 !important;
                  overflow: visible !important;
                  background: none !important; 
                  border: none !important;
              }

              /* 3. Hide specific siblings that take up space */
              .admin-sidebar, .admin-notifications, .no-print {
                  display: none !important;
              }

              /* 4. Reset Body/HTML to be a simple canvas */
              body, html { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                  width: 210mm !important; 
                  height: auto !important; /* Let content dictate height now that ghost space is gone */
                  overflow: hidden !important; 
                  background-color: white !important;
              }

              /* 5. The Invoice Container - The Star of the Show */
              .invoice-container, .invoice-container * {
                  visibility: visible !important;
              }
              
              .invoice-container { 
                  box-sizing: border-box; 
                  position: relative !important; /* Can be relative now that parents are squashed */
                  width: 210mm !important; 
                  min-height: 297mm !important;
                  margin: 0 !important; 
                  padding: 10mm !important;
                  padding-top: 50mm !important; 
                  padding-bottom: 0mm !important;
                  
                  /* Background Image */
                  background-image: url('/${invoice.letterhead || "RVT"}_Letterhead.png') !important;
                  background-size: 100% 100% !important; 
                  background-repeat: no-repeat !important;
                  background-position: center !important;
                  
                  /* Print Fidelity */
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  z-index: 9999;
                  
                  /* Ensure no page break inside */
                  page-break-inside: avoid !important;
              }
              
              /* Inputs look like text in print */
              input, textarea { border: none !important; background: transparent !important; resize: none !important; }
              input::placeholder, textarea::placeholder { color: transparent !important; }
          }
          /* Standard CSS (Non-print) */
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
          th { text-align: center; font-weight: bold; background-color: #f0f0f0; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-bold { font-weight: bold; }
          .form-input-clean {
              border: 1px solid transparent;
              background-color: transparent;
              width: 100%;
              text-align: center;
              padding: 4px;
              font-family: inherit;
              font-size: 12px;
          }
          .form-input-clean:hover {
              border: 1px dashed #eee;
          }
          .form-input-clean:focus {
              border: 1px solid blue;
              background-color: #f9f9f9;
              outline: none;
          }
          .editable-field {
              border: 1px dashed transparent;
              background: transparent;
              font-family: inherit;
              font-size: inherit;
              color: inherit;
              width: 100%;
              padding: 0;
              margin: 0;
              resize: none; /* Auto-resize via JS */
              overflow: hidden;
              white-space: pre-wrap; /* Allow wrapping */
              display: block;
              vertical-align: top;
          }
          .editable-field:hover {
              border: 1px dashed #ccc;
          }
          .editable-field:focus {
              outline: 1px solid blue;
              background: #fdfdfd;
          }
        `,
        }}
      />

      <div
        className="no-print invoice-actions"
        style={{
          textAlign: "right",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <button
          disabled={saving}
          onClick={() => handleSave(false)}
          className="btn btn-primary"
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={addLineItem}
          className="btn btn-info"
          style={{
            backgroundColor: "#17a2b8",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Item
        </button>
        <button
          disabled={saving}
          onClick={() => handleSave(true)}
          className="btn btn-secondary"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {saving ? "Save & Download" : "Save & Download"}
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "5mm" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            textDecoration: "underline",
          }}
        >
          TAX INVOICE
        </h2>
      </div>

      {/* Info Grid - Fully Editable */}
      <div
        style={{
          display: "flex",
          border: "1px solid #000",
          marginBottom: "5mm",
        }}
      >
        {/* TO Section */}
        <div
          style={{
            width: "50%",
            padding: "10px",
            borderRight: "1px solid #000",
            fontSize: "12px",
            lineHeight: "1.5",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>TO:</div>
          <textarea
            className="editable-field"
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "4px",
            }}
            value={toDetails.name}
            onChange={(e) => handleToChange("name", e.target.value)}
            rows={1}
            ref={autoResize}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
          />
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
              Address:
            </span>
            <textarea
              className="editable-field"
              value={toDetails.address}
              onChange={(e) => handleToChange("address", e.target.value)}
              placeholder="Address"
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
              P.O.Box:
            </span>
            <textarea
              className="editable-field"
              value={toDetails.poBox}
              onChange={(e) => handleToChange("poBox", e.target.value)}
              placeholder="12345, DUBAI"
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
              TRN No:
            </span>
            <textarea
              className="editable-field"
              value={toDetails.trn}
              onChange={(e) => handleToChange("trn", e.target.value)}
              placeholder="TRN Number"
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
              License No:
            </span>
            <textarea
              className="editable-field"
              value={toDetails.license}
              onChange={(e) => handleToChange("license", e.target.value)}
              placeholder="License Number"
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
              LPO No:
            </span>
            <textarea
              className="editable-field"
              value={toDetails.lpo}
              onChange={(e) => handleToChange("lpo", e.target.value)}
              placeholder="___________"
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <br />
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
              PROJECT:
            </span>
            <textarea
              className="editable-field"
              value={toDetails.project}
              onChange={(e) => handleToChange("project", e.target.value)}
              placeholder="___________"
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
        </div>

        {/* FROM Section */}
        <div
          style={{
            width: "50%",
            padding: "10px",
            fontSize: "12px",
            lineHeight: "1.4",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}>
              FROM:
            </div>
            <textarea
              className="editable-field"
              value={fromDetails.companyName}
              onChange={(e) => handleFromChange("companyName", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}>
              OFFICE:
            </div>
            <textarea
              className="editable-field"
              rows={1}
              value={fromDetails.office}
              onChange={(e) => handleFromChange("office", e.target.value)}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}>
              P.O.Box:
            </div>
            <textarea
              className="editable-field"
              value={fromDetails.poBox}
              onChange={(e) => handleFromChange("poBox", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}>
              INVOICE:
            </div>
            <div>{invoice.invoiceNo}</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}>
              DATE:
            </div>
            <div>{dateStr}</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <textarea
              className="editable-field"
              style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}
              value={fromDetails.trnLabel}
              onChange={(e) => handleFromChange("trnLabel", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
            <textarea
              className="editable-field"
              value={fromDetails.trnValue}
              onChange={(e) => handleFromChange("trnValue", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <textarea
              className="editable-field"
              style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}
              value={fromDetails.emailLabel}
              onChange={(e) => handleFromChange("emailLabel", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
            <textarea
              className="editable-field"
              style={{ color: "blue", textDecoration: "underline" }}
              value={fromDetails.emailValue}
              onChange={(e) => handleFromChange("emailValue", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <textarea
              className="editable-field"
              style={{ width: "80px", fontWeight: "bold", flexShrink: 0 }}
              value={fromDetails.mobileLabel}
              onChange={(e) => handleFromChange("mobileLabel", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
            <textarea
              className="editable-field"
              value={fromDetails.mobileValue}
              onChange={(e) => handleFromChange("mobileValue", e.target.value)}
              rows={1}
              ref={autoResize}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
          </div>
        </div>
      </div>

      <div
        style={{ marginBottom: "5mm", fontSize: "12px", fontWeight: "bold" }}
      >
        DEAR SIR,
        <br />
        <br />
        <div style={{ paddingLeft: "30px" }}>
          WE ARE SUBMITTING INVOICE WITH BELOW DETAILS.
        </div>
      </div>

      {/* Main Table - EDITABLE items */}
      <table>
        <thead>
          <tr>
            <th style={{ width: "5%" }}>S.NO</th>
            <th style={{ width: "30%" }}>DESCRIPTION</th>
            <th style={{ width: "10%" }}>UNIT</th>
            <th style={{ width: "8%" }}>QTY</th>
            <th style={{ width: "10%" }}>RATE</th>
            <th style={{ width: "12%" }}>AMOUNT</th>
            <th style={{ width: "10%" }}>TAX @ 5%</th>
            <th style={{ width: "15%" }}>TOTAL AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;

            const lineVat = total * vatRate;
            const lineGross = total + lineVat;

            // Editable Inputs
            return (
              <tr key={index}>
                <td className="text-center" style={{ position: "relative" }}>
                  <div
                    className="no-print"
                    style={{
                      position: "absolute",
                      left: "-25px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                    }}
                  >
                    <button
                      onClick={() => handleDeleteRow(index)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: "1",
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: 0,
                      }}
                      title="Delete Row"
                    >
                      -
                    </button>
                  </div>
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td style={{ padding: 0 }}>
                  <textarea
                    className="form-input-clean"
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = el.scrollHeight + "px";
                      }
                    }}
                    style={{
                      textAlign: "left",
                      paddingLeft: "4px",
                      resize: "none",
                      overflow: "hidden",
                      height: "auto",
                      minHeight: "24px",
                      whiteSpace: "pre-wrap",
                    }}
                    rows={1}
                    value={
                      item.description || `${item.material} - ${item.route}`
                    }
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    className="form-input-clean"
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="number"
                    className="form-input-clean"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <input
                    type="number"
                    className="form-input-clean"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                  />
                </td>
                <td className="text-center">
                  {total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="text-center">
                  {lineVat.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="text-center text-bold">
                  {lineGross.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}
          {/* Spacing Rows */}
          {/* Minimum rows enforcement (optional spacers) */}
          {[...Array(Math.max(0, 5 - lineItems.length))].map((_, i) => (
            <tr key={`space-${i}`}>
              <td style={{ border: "1px solid #000", height: "25px" }}></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}

          {/* Totals Section */}
          <tr>
            <td
              colSpan={5}
              rowSpan={3}
              style={{ verticalAlign: "bottom", padding: "10px" }}
            >
              <strong>IN WORD</strong>
              <br />
              <span style={{ fontStyle: "italic", marginLeft: "20px" }}>
                {numberToWords(grossAmount)}
              </span>
            </td>
            <td colSpan={2} className="text-right text-bold">
              NET AMOUNT
            </td>
            <td className="text-center text-bold">
              {subTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="text-right text-bold">
              VAT @ 5%
            </td>
            <td className="text-center text-bold">
              {vatAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="text-right text-bold"
              style={{ backgroundColor: "#f0f0f0" }}
            >
              GROSS AMOUNT
            </td>
            <td
              className="text-center text-bold"
              style={{ backgroundColor: "#f0f0f0" }}
            >
              AED{" "}
              {grossAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer Signatures */}
      <div
        style={{
          marginTop: "10mm",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        <div>
          <div>BEST REGARDS</div>
          <br />
          <div>Razmak VISION TRANSPORT BY HEAVY TRUCKS L.L.C</div>
          <div
            style={{
              marginTop: "20px",
              width: "150px",
              height: "80px",
              border: "1px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ccc",
            }}
          >
            [Stamp / Signature]
          </div>
        </div>
        <div style={{ textAlign: "right", alignSelf: "flex-end" }}>
          <div>RECEIVER'S SIGNATURE</div>
          <div
            style={{
              marginTop: "40px",
              borderTop: "1px solid #000",
              width: "150px",
              marginLeft: "auto",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
