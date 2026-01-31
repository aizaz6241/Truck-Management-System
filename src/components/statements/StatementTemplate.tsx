"use client";

import React from "react";

interface StatementItem {
  date: string;
  description: string;
  vehicle?: string;
  credit: number;
  debit: number;
  balance: number;
}

interface StatementData {
  contractorName: string;
  date: string;
  lpoNo: string;
  site: string;
  items: StatementItem[];
}

interface StatementTemplateProps {
  data?: StatementData;
}

export default function StatementTemplate({ data }: StatementTemplateProps) {
  const dummyData: StatementData = {
    contractorName: "COMPLETE HIGH ROAD CONTRACTING L.L.C (PREVIEW)",
    date: "31-12-2025",
    lpoNo: "CHRC25-07",
    site: "CREEK DUBAI & SPORTS CITY",
    items: [
      {
        date: "31/08/2025",
        description: "SIV/RVT/079",
        vehicle: "Vehicle # 76195",
        credit: 7996.06,
        debit: 0,
        balance: 7996.06,
      },
      {
        date: "31/08/2025",
        description: "SIV/RVT/080",
        vehicle: "Vehicle # 69877",
        credit: 7450.87,
        debit: 0,
        balance: 15446.93,
      },
      {
        date: "31/08/2025",
        description: "SIV/RVT/081",
        vehicle: "Vehicle # 19340",
        credit: 2507.85,
        debit: 0,
        balance: 17954.78,
      },
      {
        date: "31/08/2025",
        description: "SIV/RVT/082",
        vehicle: "Vehicle # 60342",
        credit: 3234.76,
        debit: 0,
        balance: 21189.54,
      },
      {
        date: "31/08/2025",
        description: "SIV/RVT/083",
        vehicle: "Vehicle # 74973",
        credit: 2544.2,
        debit: 0,
        balance: 23733.74,
      },
      {
        date: "31/08/2025",
        description: "SIV/RVT/084",
        vehicle: "Vehicle # 82240",
        credit: 4034.37,
        debit: 0,
        balance: 27768.11,
      },
      {
        date: "31/08/2025",
        description: "SIV/RVT/085",
        vehicle: "Vehicle # 83195",
        credit: 8214.13,
        debit: 0,
        balance: 35982.24,
      },
      {
        date: "30/09/2025",
        description: "SIV/RVT/102",
        vehicle: "Vehicle # 76195",
        credit: 6106.08,
        debit: 0,
        balance: 42088.32,
      },
      {
        date: "12/10/2025",
        description: "Received amount",
        vehicle: "",
        credit: 0,
        debit: 35989.29,
        balance: 6099.03,
      },
    ],
  };

  const statementData = data || dummyData;

  const totalCredit = statementData.items.reduce(
    (sum, item) => sum + item.credit,
    0,
  );
  const totalDebit = statementData.items.reduce(
    (sum, item) => sum + item.debit,
    0,
  );
  const finalBalance =
    statementData.items.length > 0
      ? statementData.items[statementData.items.length - 1].balance
      : 0;

  return (
    <div
      className="statement-container"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm",
        paddingTop: "50mm",
        paddingBottom: "10mm",
        margin: "0 auto",
        backgroundColor: "white",
        fontFamily: "'Calibri', 'Arial', sans-serif",
        color: "#000",
        position: "relative",
        backgroundImage: "url('/RVT_Letterhead.png')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        boxSizing: "border-box",
      }}
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .statement-container,
          .statement-container * {
            visibility: visible;
          }
          .statement-container {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 10mm !important;
            padding-top: 50mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            background-image: url("/RVT_Letterhead.png") !important;
            background-size: 100% 100% !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .statement-table th,
        .statement-table td {
          border: 1px solid #333;
          padding: 4px 6px;
          font-size: 13px;
        }
        .statement-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: "5mm" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            textDecoration: "uppercase",
            marginBottom: "5px",
          }}
        >
          STATEMENT OF ACCOUNT
        </h2>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {statementData.contractorName}
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5mm",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        <div>DATE: {statementData.date}</div>
        <div>STATEMENT NO: 0000</div>
        <div>LPO NO: {statementData.lpoNo}</div>
        <div>SITE: {statementData.site}</div>
      </div>

      <table
        className="statement-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "5mm",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "50px" }}>S.NO.</th>
            <th style={{ width: "90px" }}>DATE</th>
            <th style={{ textAlign: "center" }}>DESCRIPTION</th>
            <th style={{ width: "90px" }}>CREDIT</th>
            <th style={{ width: "90px" }}>DEBIT</th>
            <th style={{ width: "100px" }}>BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {statementData.items.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td style={{ textAlign: "center" }}>{item.date}</td>
              <td>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{item.description}</span>
                  {item.vehicle && <span>{item.vehicle}</span>}
                </div>
              </td>
              <td style={{ textAlign: "right" }}>
                {item.credit > 0
                  ? item.credit.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })
                  : ""}
              </td>
              <td style={{ textAlign: "right" }}>
                {item.debit > 0
                  ? item.debit.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })
                  : ""}
              </td>
              <td style={{ textAlign: "right" }}>
                {item.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}

          <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
            <td colSpan={3} style={{ textAlign: "center" }}>
              TOTAL AMOUNT
            </td>
            <td style={{ textAlign: "right" }}>
              {totalCredit.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td style={{ textAlign: "right" }}>
              {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </td>
            <td style={{ textAlign: "right" }}>
              {finalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <table
          className="statement-table"
          style={{ width: "60%", borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <td style={{ fontWeight: "bold" }}>Total Credit Amount</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                {totalCredit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold" }}>Total Debit Amount</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                {totalDebit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr style={{ backgroundColor: "#e0e0e0" }}>
              <td style={{ fontWeight: "bold", padding: "8px" }}>
                Balance With {statementData.contractorName.split(" ")[0]}...
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "16px",
                  padding: "8px",
                }}
              >
                {finalBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                AED
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
