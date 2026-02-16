"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import {
  ArrowLongUpIcon,
  ArrowLongDownIcon,
  ArrowsUpDownIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import DeleteTripButton from "@/components/DeleteTripButton";
import ViewPaperButton from "@/components/ViewPaperButton";
import TripPaperStatus from "@/components/TripPaperStatus";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Trip {
  id: number;
  date: Date | string;
  driver: { name: string };
  vehicle: { number: string; ownership: string };
  contractor?: { name: string } | null;
  invoice?: { contractor?: { name: string } | null } | null;
  serialNumber?: string | null;
  fromLocation: string;
  toLocation: string;
  weight?: string | null;
  companySerialNumber?: string | null;
  materialType?: string | null;
  paperImage?: string | null;
  images: { url: string }[];
  paperStatus: string;
}

interface TripsTableProps {
  trips: Trip[];
  totalPages: number;
  currentPage: number;
  totalTripsCount: number;
  routeContractorMap: Record<string, { id: number; name: string }>;
  searchParams: any; // Passed down to generate pagination/sort links
}

export default function TripsTable({
  trips,
  totalPages,
  currentPage,
  totalTripsCount,
  routeContractorMap,
  searchParams,
}: TripsTableProps) {
  const [selectedTrips, setSelectedTrips] = useState<Set<number>>(new Set());

  // Group trips by Date key (Client-side)
  const groupedTrips = useMemo(() => {
    const groups: { [key: string]: Trip[] } = {};
    trips.forEach((trip) => {
      const dateKey = new Date(trip.date).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(trip);
    });
    return groups;
  }, [trips]);

  // Sorting Helpers
  const getSortLink = (field: string) => {
    const currentSort = searchParams.sort || "date";
    const currentOrder = searchParams.order === "asc" ? "asc" : "desc";
    const newOrder =
      currentSort === field && currentOrder === "asc" ? "desc" : "asc";

    const params = new URLSearchParams(searchParams);
    params.set("sort", field);
    params.set("order", newOrder);
    return `?${params.toString()}`;
  };

  const getSortIcon = (field: string) => {
    const currentSort = searchParams.sort || "date";
    const currentOrder = searchParams.order === "asc" ? "asc" : "desc";

    if (currentSort !== field)
      return <ArrowsUpDownIcon style={{ width: "14px", marginLeft: "4px" }} />;
    return currentOrder === "asc" ? (
      <ArrowLongUpIcon style={{ width: "14px", marginLeft: "4px" }} />
    ) : (
      <ArrowLongDownIcon style={{ width: "14px", marginLeft: "4px" }} />
    );
  };

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = trips.map((t) => t.id);
      setSelectedTrips(new Set(allIds));
    } else {
      setSelectedTrips(new Set());
    }
  };

  const handleSelectDateGroup = (
    dateKey: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const groupIds = groupedTrips[dateKey].map((t) => t.id);
    const newSelected = new Set(selectedTrips);
    if (e.target.checked) {
      groupIds.forEach((id) => newSelected.add(id));
      // Log for debugging
      // console.log(`Selected group ${dateKey}, IDs:`, groupIds);
    } else {
      groupIds.forEach((id) => newSelected.delete(id));
    }
    setSelectedTrips(newSelected);
  };

  const handleSelectTrip = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newSelected = new Set(selectedTrips);
    if (e.target.checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTrips(newSelected);
  };

  const isAllSelected = trips.length > 0 && selectedTrips.size === trips.length;

  const isGroupSelected = (dateKey: string) => {
    const groupTrips = groupedTrips[dateKey];
    return groupTrips.every((t) => selectedTrips.has(t.id));
  };

  const isGroupPartiallySelected = (dateKey: string) => {
    const groupTrips = groupedTrips[dateKey];
    const selectedCount = groupTrips.filter((t) =>
      selectedTrips.has(t.id),
    ).length;
    return selectedCount > 0 && selectedCount < groupTrips.length;
  };

  // Excel Export Logic
  const handleDownloadExcel = () => {
    if (selectedTrips.size === 0) {
      alert("Please select at least one trip to export.");
      return;
    }

    const tripsToExport = trips.filter((t) => selectedTrips.has(t.id));

    const tableRows = tripsToExport.map((trip) => {
      const contractorName =
        trip.contractor?.name ||
        trip.invoice?.contractor?.name ||
        routeContractorMap[`${trip.fromLocation}|${trip.toLocation}`]?.name ||
        "-";

      return {
        Date: new Date(trip.date).toLocaleDateString(),
        Driver: trip.driver.name,
        Vehicle: trip.vehicle.number,
        Owner: trip.vehicle.ownership,
        Contractor: contractorName,
        "Serial No": trip.serialNumber || "-",
        From: trip.fromLocation,
        To: trip.toLocation,
        Weight: trip.weight || "-",
        "Company Serial No": trip.companySerialNumber || "-",
        Material: trip.materialType || "-",
        "Paper Status": trip.paperStatus,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(tableRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");
    XLSX.writeFile(
      workbook,
      `Trips_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // PDF Export Logic
  const handleDownloadPDF = () => {
    if (selectedTrips.size === 0) {
      alert("Please select at least one trip to export.");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Trips Report", 14, 22);

    // Subtitle / Date Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Selected Trips: ${selectedTrips.size}`, 14, 35);

    // Filter trips to only selected ones
    const tripsToExport = trips.filter((t) => selectedTrips.has(t.id));

    // Prepare table data
    const tableColumn = [
      "Date",
      "Driver",
      "Vehicle",
      "Owner",
      "From",
      "To",
      "Material",
      "SN",
      "Weight",
      "Comp SN",
    ];

    const tableRows = tripsToExport.map((trip) => {
      const contractorName =
        trip.contractor?.name ||
        trip.invoice?.contractor?.name ||
        routeContractorMap[`${trip.fromLocation}|${trip.toLocation}`]?.name ||
        "-";

      return [
        new Date(trip.date).toLocaleDateString(),
        trip.driver.name,
        trip.vehicle.number,
        trip.vehicle.ownership,
        trip.fromLocation,
        trip.toLocation,
        trip.materialType || "-",
        trip.serialNumber || "-",
        trip.weight || "-",
        trip.companySerialNumber || "-",
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save(`Trips_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Pagination Link Helper
  const getPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  return (
    <>
      <div
        className="actions-bar"
        style={{
          display: "flex",
          justifyContent: "flex-end", // Align to right
          alignItems: "center",
          marginBottom: "1rem",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {selectedTrips.size} Selected
          </span>
          <button
            onClick={handleDownloadExcel}
            disabled={selectedTrips.size === 0}
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: selectedTrips.size > 0 ? "#10b981" : "#e5e7eb", // Green for Excel
              color: selectedTrips.size > 0 ? "white" : "#9ca3af",
              cursor: selectedTrips.size > 0 ? "pointer" : "not-allowed",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontWeight: 500,
              transition: "background-color 0.2s",
            }}
          >
            <DocumentArrowDownIcon style={{ width: "20px", height: "20px" }} />
            Export Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={selectedTrips.size === 0}
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: selectedTrips.size > 0 ? "#ef4444" : "#e5e7eb", // Red like PDF icon roughly
              color: selectedTrips.size > 0 ? "white" : "#9ca3af",
              cursor: selectedTrips.size > 0 ? "pointer" : "not-allowed",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontWeight: 500,
              transition: "background-color 0.2s",
            }}
          >
            <DocumentArrowDownIcon style={{ width: "20px", height: "20px" }} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            minWidth: "900px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--background-color)",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                  width: "40px",
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: "var(--primary-color)",
                  }}
                />
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={getSortLink("date")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Date {getSortIcon("date")}
                </Link>
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={getSortLink("driver")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Driver {getSortIcon("driver")}
                </Link>
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Vehicle
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Owner
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={getSortLink("contractor")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Contractor {getSortIcon("contractor")}
                </Link>
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Serial No
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Route
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Weight
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Company Serial No
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Material
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Paper
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Paper Status
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedTrips).map(([groupTitle, groupTrips]) => (
              <Fragment key={groupTitle}>
                <tr style={{ backgroundColor: "#e9ecef" }}>
                  <td
                    style={{
                      padding: "0.5rem 1rem",
                      borderBottom: "1px solid #d1d5db",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isGroupSelected(groupTitle)}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate =
                            isGroupPartiallySelected(groupTitle);
                        }
                      }}
                      onChange={(e) => handleSelectDateGroup(groupTitle, e)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "var(--primary-color)",
                      }}
                    />
                  </td>
                  <td
                    colSpan={14}
                    style={{
                      padding: "0.5rem 1rem",
                      fontWeight: "bold",
                      borderBottom: "1px solid #d1d5db",
                    }}
                  >
                    {groupTitle}
                  </td>
                </tr>
                {groupTrips.map((trip: any) => (
                  <tr
                    key={trip.id}
                    style={{
                      backgroundColor: selectedTrips.has(trip.id)
                        ? "#eff6ff"
                        : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTrips.has(trip.id)}
                        onChange={(e) => handleSelectTrip(trip.id, e)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "var(--primary-color)",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "#6b7280",
                      }}
                    >
                      #{trip.id}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {new Date(trip.date).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.driver.name}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.vehicle.number}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor:
                            trip.vehicle.ownership === "RVT"
                              ? "#e3f2fd"
                              : "#fff3e0",
                          color:
                            trip.vehicle.ownership === "RVT"
                              ? "var(--primary-color)"
                              : "#e67e22",
                          fontSize: "0.875rem",
                        }}
                      >
                        {trip.vehicle.ownership}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {trip.contractor?.name ||
                        trip.invoice?.contractor?.name ||
                        routeContractorMap[
                          `${trip.fromLocation}|${trip.toLocation}`
                        ]?.name ||
                        "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {trip.serialNumber || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.fromLocation} &rarr; {trip.toLocation}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.weight || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.companySerialNumber || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.materialType || "-"}
                    </td>

                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {trip.paperImage ||
                      (trip.images && trip.images.length > 0) ? (
                        <ViewPaperButton
                          imageUrl={
                            trip.paperImage || trip.images[0]?.url || ""
                          }
                          images={trip.images.map((i: any) => i.url)}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <TripPaperStatus
                        id={trip.id}
                        initialStatus={trip.paperStatus}
                      />
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Link
                          href={`/admin/trips/${trip.id}/edit`}
                          style={{ color: "var(--primary-color)" }}
                        >
                          Edit
                        </Link>
                        <DeleteTripButton id={trip.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            {trips.length === 0 && (
              <tr>
                <td
                  colSpan={15}
                  style={{ padding: "1rem", textAlign: "center" }}
                >
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={getPageLink(1)}
            className={`btn ${currentPage <= 1 ? "disabled" : ""}`}
            style={{
              pointerEvents: currentPage <= 1 ? "none" : "auto",
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            First
          </Link>
          <Link
            href={getPageLink(currentPage - 1)}
            className={`btn ${currentPage <= 1 ? "disabled" : ""}`}
            style={{
              pointerEvents: currentPage <= 1 ? "none" : "auto",
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            Prev
          </Link>

          <span
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <Link
            href={getPageLink(currentPage + 1)}
            className={`btn ${currentPage >= totalPages ? "disabled" : ""}`}
            style={{
              pointerEvents: currentPage >= totalPages ? "none" : "auto",
              opacity: currentPage >= totalPages ? 0.5 : 1,
            }}
          >
            Next
          </Link>
        </div>
      )}
    </>
  );
}
