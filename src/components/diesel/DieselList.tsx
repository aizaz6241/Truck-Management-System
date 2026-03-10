"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { deleteDieselRecord } from "@/actions/diesel";
import AddDieselModal from "./AddDieselModal";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import SetDieselPriceModal from "./SetDieselPriceModal";

interface DieselListProps {
  initialData: any[];
  vehicles: any[];
  drivers: any[];
  isDriverView?: boolean;
}

export default function DieselList({
  initialData,
  vehicles,
  drivers,
  isDriverView = false,
}: DieselListProps) {
  const [records, setRecords] = useState(initialData);

  // Update records when initialData changes (e.g. after adding via external button or refresh)
  useEffect(() => {
    setRecords(initialData);
  }, [initialData]);

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [filterOwnership, setFilterOwnership] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const matchesSearch =
          record.vehicle.number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (!isDriverView &&
            (record.driver?.name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

        const matchesVehicle = filterVehicle
          ? record.vehicleId.toString() === filterVehicle
          : true;
        const matchesDriver = filterDriver
          ? record.driverId?.toString() === filterDriver
          : true;
        const matchesOwnership = filterOwnership
          ? record.vehicle.ownership === filterOwnership
          : true;

        const recordDate = new Date(record.date);
        const matchesMonth = filterMonth
          ? recordDate.toISOString().slice(0, 7) === filterMonth
          : true;
        const matchesDate = filterDate
          ? recordDate.toISOString().slice(0, 10) === filterDate
          : true;

        return (
          matchesSearch &&
          matchesVehicle &&
          matchesDriver &&
          matchesOwnership &&
          matchesMonth &&
          matchesDate
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    records,
    searchQuery,
    filterVehicle,
    filterDriver,
    filterOwnership,
    filterMonth,
    filterDate,
    isDriverView,
  ]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setDeletingId(id);
    const res = await deleteDieselRecord(id);
    if (res.success) {
      setRecords(records.filter((r) => r.id !== id));
    } else {
      alert(res.error || "Failed to delete record");
    }
    setDeletingId(null);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  // Multiple Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allVisibleIds = filteredRecords.map((r) => r.id);
      setSelectedIds(new Set(allVisibleIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRecord = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newSelected = new Set(selectedIds);
    if (e.target.checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected =
    filteredRecords.length > 0 && selectedIds.size === filteredRecords.length;

  // Excel Export Logic
  const handleExportExcel = () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one record to export.");
      return;
    }

    const recordsToExport = records.filter((r) => selectedIds.has(r.id));

    const data = recordsToExport.map((r) => ({
      Date: new Date(r.date).toLocaleDateString("en-GB"),
      Vehicle: r.vehicle.number,
      Ownership: r.vehicle.ownership,
      Owner: r.vehicle.ownership === "Taxi" ? r.vehicle.ownerName : "RVT",
      Driver: r.driver?.name || "Unassigned",
      Liters: r.liters.toFixed(2),
      "Price/L": r.pricePerLiter.toFixed(2),
      Total: `AED ${r.totalAmount.toLocaleString()}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diesel Records");
    XLSX.writeFile(
      workbook,
      `Diesel_Records_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // PDF Export Logic
  const handleExportPDF = () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one record to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Diesel Consumption Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Records: ${selectedIds.size}`, 14, 35);

    const recordsToExport = records.filter((r) => selectedIds.has(r.id));
    const tableColumn = [
      "Date",
      "Vehicle",
      "Owner/Ownership",
      "Driver",
      "Liters",
      "Price/L",
      "Total",
    ];
    const tableRows = recordsToExport.map((r) => [
      new Date(r.date).toLocaleDateString("en-GB"),
      r.vehicle.number,
      r.vehicle.ownership === "Taxi" ? `Taxi: ${r.vehicle.ownerName}` : "RVT",
      r.driver?.name || "-",
      r.liters.toFixed(2),
      r.pricePerLiter.toFixed(2),
      `AED ${r.totalAmount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save(`Diesel_Records_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const [showPriceModal, setShowPriceModal] = useState(false);

  return (
    <div className="diesel-list-container">
      {/* Controls & Statistics Bar */}
      <div className="diesel-controls-bar">
        {/* ... existing filters ... */}
        {/* Search */}
        <div className="diesel-search-wrapper">
          <div className="diesel-search-icon">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search vehicle or driver..."
            className="diesel-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Ownership - Hide for Driver */}
        {!isDriverView && (
          <div className="diesel-filter-wrapper ownership">
            <select
              value={filterOwnership}
              onChange={(e) => setFilterOwnership(e.target.value)}
              className="diesel-filter-select"
            >
              <option value="">All Ownership</option>
              <option value="RVT">RVT</option>
              <option value="Taxi">Taxi</option>
            </select>
          </div>
        )}

        {/* Filter Vehicle */}
        <div className="diesel-filter-wrapper vehicle">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="diesel-filter-select"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.number}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Driver - Hide for Driver */}
        {!isDriverView && (
          <div className="diesel-filter-wrapper driver">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="diesel-filter-select"
            >
              <option value="">All Drivers</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Month */}
        <div className="diesel-filter-wrapper month">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setFilterDate(""); // Clear date when month is selected
            }}
            className="diesel-filter-input"
            title="Filter by Month"
          />
        </div>

        {/* Filter Date */}
        <div className="diesel-filter-wrapper date">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setFilterMonth(""); // Clear month when date is selected
            }}
            className="diesel-filter-input"
            title="Filter by Date"
          />
        </div>

        {/* Action Buttons */}
        <div
          className="diesel-add-btn-wrapper"
          style={{ display: "flex", gap: "0.5rem" }}
        >
          {!isDriverView && (
            <button
              onClick={() => setShowPriceModal(true)}
              className="diesel-add-btn"
              style={{ backgroundColor: "#10b981", borderColor: "#059669" }}
            >
              <CurrencyDollarIcon className="w-5 h-5" />
              Set Prices
            </button>
          )}
          <button
            onClick={handleAdd}
            className={`diesel-add-btn ${
              isDriverView
                ? "!bg-amber-500 !hover:bg-amber-600 !border-amber-600"
                : ""
            }`}
            style={
              isDriverView
                ? { backgroundColor: "#f59e0b", borderColor: "#d97706" }
                : {}
            }
          >
            <PlusIcon className="w-5 h-5" />
            Add Record
          </button>
        </div>
      </div>

      {/* Selection Actions Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            {selectedIds.size} Records Selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={selectedIds.size === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              selectedIds.size > 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
            }`}
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={selectedIds.size === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              selectedIds.size > 0
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
            }`}
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="diesel-table-container">
        <div className="diesel-table-responsive">
          <table className="diesel-table">
            <thead>
              <tr className="diesel-table-header">
                <th
                  className="diesel-table-cell"
                  style={{ width: "40px", padding: "1.25rem 1rem" }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th className="diesel-table-cell">Date</th>
                <th className="diesel-table-cell">Vehicle</th>
                {!isDriverView && (
                  <th className="diesel-table-cell">Ownership</th>
                )}
                {!isDriverView && <th className="diesel-table-cell">Driver</th>}
                <th
                  className="diesel-table-cell"
                  style={{ textAlign: "right" }}
                >
                  Liters
                </th>
                <th
                  className="diesel-table-cell"
                  style={{ textAlign: "right" }}
                >
                  Price/L
                </th>
                <th
                  className="diesel-table-cell"
                  style={{ textAlign: "right" }}
                >
                  Total
                </th>
                <th
                  className="diesel-table-cell"
                  style={{ textAlign: "right" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isDriverView ? 7 : 9}>
                    <div className="diesel-empty-state">
                      <div className="diesel-empty-icon-wrapper">
                        <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-900 font-medium mb-1">
                        No records found
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Try adjusting your search or filters, or add a new
                        diesel record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => {
                  const recordDate = new Date(record.date).toLocaleDateString(
                    "en-GB",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  );
                  const prevRecord = filteredRecords[index - 1];
                  const prevDate = prevRecord
                    ? new Date(prevRecord.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null;
                  const showSeparator = recordDate !== prevDate;

                  return (
                    <Fragment key={record.id}>
                      {showSeparator && (
                        <tr className="diesel-date-separator-row">
                          <td
                            colSpan={isDriverView ? 7 : 9}
                            className="diesel-date-separator-cell"
                          >
                            <div className="diesel-date-separator-content">
                              <span className="diesel-date-separator-text">
                                {recordDate}
                              </span>
                              <div className="diesel-date-separator-line"></div>
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr
                        className={`diesel-table-row group ${
                          selectedIds.has(record.id) ? "!bg-amber-50/50" : ""
                        }`}
                      >
                        <td
                          className="diesel-table-cell"
                          style={{ padding: "1rem 1rem" }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(record.id)}
                            onChange={(e) => handleSelectRecord(record.id, e)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>
                        <td className="diesel-table-cell date">
                          {new Date(record.date).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="diesel-table-cell">
                          <span className="diesel-badge-vehicle">
                            {record.vehicle.number}
                          </span>
                        </td>
                        {!isDriverView && (
                          <td className="diesel-table-cell">
                            <span
                              className={`diesel-ownership-badge ${
                                record.vehicle.ownership === "Taxi"
                                  ? "taxi"
                                  : "rvt"
                              }`}
                            >
                              {record.vehicle.ownership === "Taxi"
                                ? `Taxi: ${
                                    record.vehicle.ownerName || "Unknown"
                                  }`
                                : "RVT"}
                            </span>
                          </td>
                        )}
                        {!isDriverView && (
                          <td className="diesel-table-cell">
                            {record.driver ? (
                              <div className="diesel-driver-info">
                                <div className="diesel-driver-avatar">
                                  {record.driver.name.charAt(0)}
                                </div>
                                <span className="diesel-driver-name">
                                  {record.driver.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                Unassigned
                              </span>
                            )}
                          </td>
                        )}
                        <td className="diesel-table-cell diesel-cell-numeric">
                          {record.liters.toFixed(2)}
                          <span className="text-gray-400 text-xs ml-1">L</span>
                        </td>
                        <td className="diesel-table-cell diesel-cell-numeric">
                          {record.pricePerLiter.toFixed(2)}
                        </td>
                        <td className="diesel-table-cell diesel-cell-numeric">
                          <span className="diesel-cell-total">
                            AED {record.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="diesel-table-cell">
                          <div className="diesel-actions-cell">
                            <button
                              onClick={() => handleEdit(record)}
                              className="diesel-action-btn edit"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            {!isDriverView && (
                              <button
                                onClick={() => handleDelete(record.id)}
                                disabled={deletingId === record.id}
                                className="diesel-action-btn delete"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDieselModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        vehicles={vehicles}
        drivers={drivers}
        initialData={editingRecord}
        onSuccess={(result) => {
          if (editingRecord) {
            setRecords(records.map((r) => (r.id === result.id ? result : r)));
          } else {
            // result can be an array in batch mode or a single object
            if (Array.isArray(result)) {
              setRecords([...result, ...records]);
            } else {
              setRecords([result, ...records]);
            }
          }
          setShowModal(false);
        }}
      />

      <SetDieselPriceModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        onSuccess={() => {
          // Since it's a bulk operation on existing records,
          // we should ideally re-fetch all data or refresh the page.
          // The easiest way to ensure consistency is a reload,
          // or we can just rely on the server revalidation if the parent re-renders.
          window.location.reload();
        }}
      />
    </div>
  );
}
