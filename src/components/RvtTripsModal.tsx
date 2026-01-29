"use client";

import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getTripsByRange } from "@/actions/trip";
import RvtTripsPieChart from "./RvtTripsPieChart";

interface Trip {
  id: number;
  fromLocation: string;
  toLocation: string;
  vehicle: {
    number: string;
    ownership: string;
  };
  driver: {
    name: string;
  };
}

interface RvtTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
}

export default function RvtTripsModal({
  isOpen,
  onClose,
  trips,
}: RvtTripsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tripsData, setTripsData] = useState<Trip[]>(trips);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTripsData(trips);
    // Reset date range when modal opens/closes or props change
    setDateRange({ startDate: "", endDate: "" });
  }, [trips, isOpen]);

  const handleFilter = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    setIsLoading(true);
    try {
      const filteredTrips = await getTripsByRange(
        dateRange.startDate,
        dateRange.endDate,
      );
      setTripsData(filteredTrips);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 44, 52);
    doc.text("RVT Trips Report", 14, 22);

    // Date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);

    let dateText = `Date: ${new Date().toLocaleDateString()}`;
    if (dateRange.startDate && dateRange.endDate) {
      dateText = `Range: ${new Date(
        dateRange.startDate,
      ).toLocaleDateString()} to ${new Date(
        dateRange.endDate,
      ).toLocaleDateString()}`;
    }
    doc.text(dateText, 14, 30);

    // Grouping Logic for PDF
    const grouped: {
      [vehicleNo: string]: {
        vehicleNo: string;
        driverName: string;
        count: number;
        routes: string[];
      };
    } = {};

    tripsData.forEach((trip) => {
      const vNo = trip.vehicle.number;
      if (!grouped[vNo]) {
        grouped[vNo] = {
          vehicleNo: vNo,
          driverName: trip.driver.name,
          count: 0,
          routes: [],
        };
      }
      grouped[vNo].count += 1;
      grouped[vNo].routes.push(`${trip.fromLocation} -> ${trip.toLocation}`);
    });
    const pdfTableData = Object.values(grouped);

    // Table
    const tableColumn = ["Vehicle No", "Driver Name", "Trip Count", "Routes"];
    const tableRows = pdfTableData.map((row) => [
      row.vehicleNo,
      row.driverName,
      row.count,
      row.routes.map((r) => r.replace(/→/g, "->")).join("\n"),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // blue-600
      alternateRowStyles: { fillColor: [249, 250, 251] }, // gray-50
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold" }, // Vehicle No
        3: { cellWidth: 80 }, // Wider column for routes
      },
    });

    const fileName =
      dateRange.startDate && dateRange.endDate
        ? `RVT_Trips_${dateRange.startDate}_${dateRange.endDate}.pdf`
        : `RVT_Trips_${new Date().toISOString().split("T")[0]}.pdf`;

    doc.save(fileName);
  };

  // Group trips by vehicle number for Display
  const groupedTrips: {
    [vehicleNo: string]: {
      vehicleNo: string;
      driverName: string;
      count: number;
      routes: string[];
    };
  } = {};

  tripsData.forEach((trip) => {
    const vNo = trip.vehicle.number;
    if (!groupedTrips[vNo]) {
      groupedTrips[vNo] = {
        vehicleNo: vNo,
        driverName: trip.driver.name,
        count: 0,
        routes: [],
      };
    }
    groupedTrips[vNo].count += 1;
    groupedTrips[vNo].routes.push(`${trip.fromLocation} → ${trip.toLocation}`);
  });

  const tableData = Object.values(groupedTrips);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(17, 24, 39, 0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        style={{
          position: "relative",
          zIndex: 100000,
          width: "100%",
          maxWidth: "1200px", // Increased width
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #f3f4f6",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: 0,
                }}
              >
                <TruckIcon
                  style={{ height: "24px", width: "24px", color: "#2563eb" }}
                />
                RVT Trips Report
              </h3>
              <p
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Summary of all vehicle activity.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: "9999px",
                padding: "0.5rem",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#9ca3af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.color = "#6b7280";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon
                style={{ height: "24px", width: "24px" }}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Filters Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              paddingTop: "0.5rem",
              borderTop: "1px solid #f9fafb",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                From:
              </span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                style={{
                  padding: "0.375rem 0.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem",
                  color: "#111827",
                  outline: "none",
                }}
              />
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                To:
              </span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                style={{
                  padding: "0.375rem 0.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem",
                  color: "#111827",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={handleFilter}
              disabled={isLoading || !dateRange.startDate || !dateRange.endDate}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.375rem",
                backgroundColor: "#2563eb",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: "500",
                border: "none",
                cursor:
                  isLoading || !dateRange.startDate || !dateRange.endDate
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  isLoading || !dateRange.startDate || !dateRange.endDate
                    ? 0.7
                    : 1,
              }}
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <FunnelIcon style={{ height: "16px", width: "16px" }} />
                  Filter
                </>
              )}
            </button>

            <div style={{ flex: 1 }}></div>

            <button
              type="button"
              onClick={handleDownloadPDF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #2563eb",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontWeight: "600",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#dbeafe";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#eff6ff";
              }}
            >
              <ArrowDownTrayIcon style={{ height: "18px", width: "18px" }} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Main Content Flex Container */}
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            flexDirection: "row",
          }}
        >
          {/* Left Column - Pie Chart (Visible on lg screens, hidden or stacked on small if strictly desired, but keeping basic flex for simple responsiveness) */}
          <div
            style={{
              width: "350px", // Fixed width for chart panel
              borderRight: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ChartPieIcon
                style={{ height: "20px", width: "20px", color: "#6b7280" }}
              />
              <h4
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Trip Distribution
              </h4>
            </div>
            <div style={{ flex: 1, padding: "1rem", minHeight: "300px" }}>
              <RvtTripsPieChart trips={tripsData} />
            </div>
          </div>

          {/* Right Column - Trip List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    border: "3px solid #f3f4f6",
                    borderTop: "3px solid #2563eb",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    animation: "spin 1s linear infinite",
                    marginRight: "0.5rem",
                  }}
                >
                  <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                  </style>
                </div>
                Loading trips...
              </div>
            ) : (
              <div
                style={{
                  overflow: "hidden",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                <table
                  style={{
                    minWidth: "100%",
                    borderCollapse: "collapse",
                    width: "100%",
                  }}
                >
                  <thead style={{ backgroundColor: "#f9fafb" }}>
                    <tr>
                      <th
                        scope="col"
                        style={{
                          padding: "1rem 1.5rem",
                          textAlign: "left",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Vehicle & Driver
                      </th>
                      <th
                        scope="col"
                        style={{
                          padding: "1rem 0.75rem",
                          textAlign: "center",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Trips Count
                      </th>
                      <th
                        scope="col"
                        style={{
                          padding: "1rem 0.75rem",
                          textAlign: "left",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Routes Timeline
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: "white" }}>
                    {tableData.length > 0 ? (
                      tableData.map((row) => (
                        <tr
                          key={row.vehicleNo}
                          style={{
                            borderBottom: "1px solid #e5e7eb",
                            transition: "background-color 0.15s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#eff6ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "white")
                          }
                        >
                          <td
                            style={{
                              padding: "1.25rem 1.5rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  height: "40px",
                                  width: "40px",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "0.5rem",
                                  backgroundColor: "#dbeafe",
                                  color: "#2563eb",
                                  marginRight: "1rem",
                                }}
                              >
                                <TruckIcon
                                  style={{ height: "24px", width: "24px" }}
                                />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    color: "#111827",
                                    fontSize: "1rem",
                                  }}
                                >
                                  {row.vehicleNo}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "#6b7280",
                                  }}
                                >
                                  {row.driverName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1.25rem 0.75rem",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                height: "2rem",
                                width: "2rem",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "9999px",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                fontWeight: "700",
                                border: "1px solid #dbeafe",
                                fontSize: "0.875rem",
                              }}
                            >
                              {row.count}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "1.25rem 0.75rem",
                              verticalAlign: "middle",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                              }}
                            >
                              {row.routes.map((route, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    borderRadius: "0.375rem",
                                    backgroundColor: "#f9fafb",
                                    padding: "0.375rem 0.625rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "500",
                                    color: "#374151",
                                    border: "1px solid #e5e7eb",
                                  }}
                                >
                                  <span
                                    style={{
                                      marginRight: "0.375rem",
                                      display: "flex",
                                      height: "16px",
                                      width: "16px",
                                      flexShrink: 0,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "9999px",
                                      backgroundColor: "#dbeafe",
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      color: "#1d4ed8",
                                    }}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span
                                    style={{
                                      maxWidth: "200px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {route}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ padding: "3rem 1rem", textAlign: "center" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#9ca3af",
                            }}
                          >
                            <MapPinIcon
                              style={{
                                height: "48px",
                                width: "48px",
                                marginBottom: "0.75rem",
                                color: "#d1d5db",
                              }}
                            />
                            <p
                              style={{
                                fontSize: "1.125rem",
                                fontWeight: "500",
                                color: "#111827",
                              }}
                            >
                              No Trips Found
                            </p>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                marginTop: "0.25rem",
                                maxWidth: "24rem",
                              }}
                            >
                              No RVT trips found for the selected date range.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "inline-flex",
              justifyContent: "center",
              borderRadius: "0.5rem",
              backgroundColor: "white",
              padding: "0.625rem 1rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#111827",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              border: "1px solid #d1d5db",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
