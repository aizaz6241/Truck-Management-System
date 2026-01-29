"use client";

import { useState } from "react";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: any[];
  onAdd: (items: any[]) => void;
}

export default function AddItemModal({
  isOpen,
  onClose,
  availableItems,
  onAdd,
}: AddItemModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleAdd = () => {
    const itemsToAdd = availableItems.filter((item) =>
      selectedIds.has(item.id),
    );
    onAdd(itemsToAdd);
    onClose();
    setSelectedIds(new Set());
  };

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
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
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
          Add Missing Items
        </h2>

        {availableItems.length === 0 ? (
          <div className="text-gray-500 text-center p-4">
            No active invoices or payments found for this contractor.
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #eee",
              marginBottom: "1rem",
            }}
          >
            <table
              style={{
                width: "100%",
                fontSize: "14px",
                borderCollapse: "collapse",
              }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedIds(
                            new Set(availableItems.map((i) => i.id)),
                          );
                        else setSelectedIds(new Set());
                      }}
                      checked={
                        selectedIds.size === availableItems.length &&
                        availableItems.length > 0
                      }
                    />
                  </th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {availableItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>
                    <td className="p-2">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${item.type === "INVOICE" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-right">
                      {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
}
