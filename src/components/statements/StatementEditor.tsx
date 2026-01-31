"use client";

import "./statement-print.css";
import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  Bars3Icon,
  MinusCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { updateStatement, getAvailableItems } from "@/actions/statement";
import AddItemModal from "./AddItemModal";
import PrintPortal from "../PrintPortal";

interface StatementItem {
  id: string; // Add ID for drag and drop key
  date: string;
  description: string;
  vehicle?: string;
  credit: number;
  debit: number;
  balance: number;
  type?: string;
  originalId?: number; // For tracking
}

interface StatementData {
  contractorName: string;
  date: string;
  lpoNo: string;
  site: string;
  items: StatementItem[];
}

interface StatementEditorProps {
  initialData: StatementData;
  statementId: number;
  contractorId?: number;
  letterhead?: string;
}

// Sortable Row Component
function SortableRow({
  item,
  index,
  onDelete,
  isEditing,
}: {
  item: StatementItem;
  index: number;
  onDelete: (id: string) => void;
  isEditing: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : 1,
    backgroundColor: isDragging ? "#f3f4f6" : "transparent",
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {isEditing && (
        <td
          style={{
            width: "40px",
            textAlign: "center",
            border: "none",
            backgroundColor: "transparent",
            padding: "0 8px 0 0",
          }}
          className="print:hidden"
        >
          <button
            onClick={() => onDelete(item.id)}
            style={{
              color: "#ef4444", // Red-500
              background: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
            title="Remove Item"
          >
            <MinusCircleIcon className="w-5 h-5" />
          </button>
        </td>
      )}
      <td style={{ textAlign: "center", position: "relative" }}>
        <div className="flex items-center justify-center gap-2">
          {isEditing && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:text-gray-700 text-gray-400 print:hidden"
            >
              <Bars3Icon className="w-4 h-4" />
            </div>
          )}
          {index + 1}
        </div>
      </td>
      <td style={{ textAlign: "center" }}>{item.date}</td>
      <td>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{item.description}</span>
          {item.vehicle && <span>{item.vehicle}</span>}
        </div>
      </td>
      <td style={{ textAlign: "right" }}>
        {item.credit > 0
          ? item.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })
          : ""}
      </td>
      <td style={{ textAlign: "right" }}>
        {item.debit > 0
          ? item.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })
          : ""}
      </td>
      <td style={{ textAlign: "right" }}>
        {item.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

export default function StatementEditor({
  initialData,
  statementId,
  contractorId,
  letterhead,
}: StatementEditorProps) {
  // Ensure items have internal IDs if missing
  const [data, setData] = useState<StatementData>(() => ({
    ...initialData,
    items: initialData.items.map((item, i) => ({
      ...item,
      id: item.id || `item-${i}-${Date.now()}`,
    })),
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const recalculateBalances = (items: StatementItem[]) => {
    let runningBalance = 0;
    return items.map((item) => {
      if (item.credit > 0) runningBalance += item.credit;
      if (item.debit > 0) runningBalance -= item.debit;

      return { ...item, balance: runningBalance };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setData((prev) => {
        const oldIndex = prev.items.findIndex((i) => i.id === active.id);
        const newIndex = prev.items.findIndex((i) => i.id === over?.id);

        const newItems = arrayMove(prev.items, oldIndex, newIndex);
        const recalculated = recalculateBalances(newItems);

        return {
          ...prev,
          items: recalculated,
        };
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this item from statement?")) return;

    setData((prev) => {
      const newItems = prev.items.filter((i) => i.id !== id);
      const recalculated = recalculateBalances(newItems);
      return {
        ...prev,
        items: recalculated,
      };
    });
  };

  const openAddModal = async () => {
    if (!contractorId) {
      alert(
        "No Contractor ID associated with this statement. Cannot fetch items.",
      );
      return;
    }
    setIsAdding(true);
    setLoadingItems(true);
    // Fetch available items
    // Existing IDs format: "inv-123", "pay-456"
    const existingIds = data.items.map((i) => i.id);

    const res = await getAvailableItems(contractorId, existingIds);
    if (res.success && res.data) {
      setAvailableItems(res.data);
    } else {
      alert("Failed to fetch available items");
    }
    setLoadingItems(false);
  };

  const handleAddItems = (newItems: any[]) => {
    // Convert new items to StatementItem format
    const converted: StatementItem[] = newItems.map((i) => ({
      id: i.id,
      date: new Date(i.date).toLocaleDateString("en-GB"),
      description: i.description,
      credit: i.type === "INVOICE" ? i.amount : 0,
      debit: i.type === "PAYMENT" ? i.amount : 0,
      balance: 0, // Recalculated later
      vehicle: "",
      type: i.type,
      originalId: i.originalId,
    }));

    setData((prev) => {
      const combined = [...prev.items, ...converted];
      const recalculated = recalculateBalances(combined);
      return { ...prev, items: recalculated };
    });
  };

  const handleSave = async () => {
    const res = await updateStatement(statementId, JSON.stringify(data));
    if (res.success) {
      setIsEditing(false);
      // Optional: Show success toast
    } else {
      alert("Failed to save changes");
    }
  };

  // Totals
  const totalCredit = data.items.reduce((sum, item) => sum + item.credit, 0);
  const totalDebit = data.items.reduce((sum, item) => sum + item.debit, 0);
  const finalBalance =
    data.items.length > 0 ? data.items[data.items.length - 1].balance : 0;

  // Pagination Logic Helper
  const PAGE_1_LIMIT = 15;
  const PAGE_N_LIMIT = 24;
  const FOOTER_ITEMS_SPACE = 6;

  const pages: StatementItem[][] = [];
  let currentItems = [...data.items];
  let pageIndex = 0;

  while (currentItems.length > 0) {
    const limit = pageIndex === 0 ? PAGE_1_LIMIT : PAGE_N_LIMIT;
    const chunk = currentItems.splice(0, limit);
    pages.push(chunk);
    pageIndex++;
  }
  if (pages.length === 0) pages.push([]);

  // Check footer space on last page
  const lastPageIndex = pages.length - 1;
  const lastPageItems = pages[lastPageIndex];
  const limitForLast = lastPageIndex === 0 ? PAGE_1_LIMIT : PAGE_N_LIMIT;

  if (lastPageItems.length > limitForLast - FOOTER_ITEMS_SPACE) {
    pages.push([]);
  }

  const renderPages = (forPrint: boolean) => {
    return pages.map((pageItems, index) => {
      const isFirstPage = index === 0;
      const isLastPage = index === pages.length - 1;

      return (
        <div
          key={index}
          className="page-wrapper mb-8 print:mb-0 flex justify-center print:block"
        >
          <div
            className="a4-page shadow-lg print:shadow-none"
            style={{
              width: "210mm",
              height: "297mm",
              padding: "10mm",
              paddingTop: "50mm",
              paddingBottom: "20mm",
              backgroundColor: "white",
              fontFamily: "'Calibri', 'Arial', sans-serif",
              color: "#000",
              backgroundImage: `url('/${letterhead || "RVT"}_Letterhead.png')`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {isFirstPage && (
              <>
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
                    {data.contractorName}
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
                  <div>DATE: {data.date}</div>
                  <div>
                    STATEMENT NO: {String(statementId).padStart(4, "0")}
                  </div>
                  <div>LPO NO: {data.lpoNo}</div>
                  <div>SITE: {data.site}</div>
                </div>
              </>
            )}

            {!isFirstPage && <div style={{ height: "20mm" }}></div>}

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
                  {isEditing && !forPrint && (
                    <th
                      style={{
                        width: "40px",
                        border: "none",
                        backgroundColor: "transparent",
                      }}
                      className="print:hidden"
                    ></th>
                  )}
                  <th style={{ width: "50px" }}>S.NO.</th>
                  <th style={{ width: "90px" }}>DATE</th>
                  <th style={{ textAlign: "center" }}>DESCRIPTION</th>
                  <th style={{ width: "90px" }}>CREDIT</th>
                  <th style={{ width: "90px" }}>DEBIT</th>
                  <th style={{ width: "100px" }}>BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const globalIndex = data.items.findIndex(
                    (x) => x.id === item.id,
                  );
                  const showSortable = isEditing && !forPrint;

                  return showSortable ? (
                    <SortableRow
                      key={item.id}
                      item={item}
                      index={globalIndex}
                      onDelete={handleDelete}
                      isEditing={true}
                    />
                  ) : (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{globalIndex + 1}</td>
                      <td style={{ textAlign: "center" }}>{item.date}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
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
                  );
                })}
                {isLastPage && (
                  <tr
                    style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}
                  >
                    {isEditing && !forPrint && (
                      <td
                        className="print:hidden"
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                        }}
                      ></td>
                    )}
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      TOTAL AMOUNT
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {totalCredit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {totalDebit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {finalBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {isLastPage && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <table
                    className="statement-table"
                    style={{ width: "60%", borderCollapse: "collapse" }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: "bold" }}>
                          Total Credit Amount
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "bold" }}>
                          {totalCredit.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold" }}>
                          Total Debit Amount
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "bold" }}>
                          {totalDebit.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: "#e0e0e0" }}>
                        <td style={{ fontWeight: "bold", padding: "8px" }}>
                          Total Balance
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
                <div
                  style={{
                    marginTop: "15mm",
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  RAZMAK VISION TRANSPORT BY HEAVY TRUCK
                </div>
              </>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Toolbar */}
      <div
        style={{
          width: "100%",
          maxWidth: "210mm",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
        className="print:hidden"
      >
        <div style={{ display: "flex", gap: "10px" }}>
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <PencilIcon
                  className="w-4 h-4"
                  style={{ width: "16px", height: "16px" }}
                />{" "}
                Edit Statement
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <ArrowDownTrayIcon
                  className="w-4 h-4"
                  style={{ width: "16px", height: "16px" }}
                />{" "}
                Download PDF
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <CheckIcon
                  className="w-4 h-4"
                  style={{ width: "16px", height: "16px" }}
                />{" "}
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <XMarkIcon
                  className="w-4 h-4"
                  style={{ width: "16px", height: "16px" }}
                />{" "}
                Cancel
              </button>
              <div
                style={{
                  width: "1px",
                  height: "32px",
                  backgroundColor: "#e5e7eb",
                  margin: "0 8px",
                }}
              ></div>
              <button
                onClick={openAddModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#9333ea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <PlusIcon
                  className="w-4 h-4"
                  style={{ width: "16px", height: "16px" }}
                />{" "}
                Add Item
              </button>
            </>
          )}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#6b7280",
            fontWeight: "500",
            padding: "4px 12px",
            backgroundColor: "#f9fafb",
            borderRadius: "9999px",
            border: "1px solid #f3f4f6",
          }}
        >
          {isEditing ? "Editing Mode: Drag to reorder" : "Preview Mode"}
        </div>
      </div>

      <AddItemModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        availableItems={availableItems}
        onAdd={handleAddItems}
      />

      <div className="state-screen-area print:hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.items}
            strategy={verticalListSortingStrategy}
            disabled={!isEditing}
          >
            {renderPages(false)}
          </SortableContext>
        </DndContext>
      </div>

      <PrintPortal>
        <div className="state-print-portal hidden print:block">
          {renderPages(true)}
        </div>
      </PrintPortal>
    </div>
  );
}
