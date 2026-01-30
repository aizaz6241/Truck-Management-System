"use client";

import { useState, useMemo } from "react";
import { deleteDieselRecord } from "@/actions/diesel";
import AddDieselModal from "./AddDieselModal";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface DieselListProps {
  initialData: any[];
  vehicles: any[];
  drivers: any[];
}

export default function DieselList({
  initialData,
  vehicles,
  drivers,
}: DieselListProps) {
  const [records, setRecords] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [filterOwnership, setFilterOwnership] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.vehicle.number
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (record.driver?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

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
    });
  }, [
    records,
    searchQuery,
    filterVehicle,
    filterDriver,
    filterOwnership,
    filterMonth,
    filterDate,
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

  return (
    <div className="diesel-list-container">
      {/* Controls & Statistics Bar */}
      <div className="diesel-controls-bar">
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

        {/* Filter Ownership */}
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

        {/* Filter Driver */}
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

        {/* Add Button */}
        <div className="diesel-add-btn-wrapper">
          <button onClick={handleAdd} className="diesel-add-btn">
            <PlusIcon className="w-5 h-5" />
            Add Record
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="diesel-table-container">
        <div className="diesel-table-responsive">
          <table className="diesel-table">
            <thead>
              <tr className="diesel-table-header">
                <th className="diesel-table-cell">Date</th>
                <th className="diesel-table-cell">Vehicle</th>
                <th className="diesel-table-cell">Ownership</th>
                <th className="diesel-table-cell">Driver</th>
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
                  <td colSpan={8}>
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
                filteredRecords.map((record) => (
                  <tr key={record.id} className="diesel-table-row group">
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
                    <td className="diesel-table-cell">
                      <span
                        className={`diesel-ownership-badge ${
                          record.vehicle.ownership === "Taxi" ? "taxi" : "rvt"
                        }`}
                      >
                        {record.vehicle.ownership === "Taxi"
                          ? `Taxi: ${record.vehicle.ownerName || "Unknown"}`
                          : "RVT"}
                      </span>
                    </td>
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
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="diesel-action-btn delete"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
        onSuccess={(updatedRecord) => {
          if (editingRecord) {
            setRecords(
              records.map((r) =>
                r.id === updatedRecord.id ? updatedRecord : r,
              ),
            );
          } else {
            setRecords([updatedRecord, ...records]);
          }
          setShowModal(false);
        }}
      />
    </div>
  );
}
