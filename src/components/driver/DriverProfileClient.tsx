"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  ChartBarIcon,
  DocumentTextIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
// Import Components
import DriverAnalytics from "@/components/DriverAnalytics";
import DriverDetails from "./DriverDetails";
import TripsTable from "@/components/TripsTable";

interface DriverProfileClientProps {
  driver: any;
  trips: any[];
  totalPages: number;
  currentPage: number;
  totalTripsCount: number;
  routeContractorMap: Record<string, { id: number; name: string }>;
  searchParams: any;
}

export default function DriverProfileClient({
  driver,
  trips,
  totalPages,
  currentPage,
  totalTripsCount,
  routeContractorMap,
  searchParams,
}: DriverProfileClientProps) {
  // Tabs: 'analytics', 'details', 'documents', 'trips', 'leaves', 'expenses'
  const [activeTab, setActiveTab] = useState("analytics");

  const tabs = [
    { id: "analytics", label: "Analytics", icon: ChartBarIcon },
    { id: "details", label: "Details", icon: DocumentTextIcon },
    { id: "documents", label: "Documents", icon: ClipboardDocumentListIcon },
    { id: "trips", label: "Trips", icon: TruckIcon },
    { id: "leaves", label: "Leaves", icon: CalendarDaysIcon },
    { id: "expenses", label: "Expenses", icon: BanknotesIcon },
  ];

  return (
    <div className="container" style={{ maxWidth: "98%", marginTop: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/admin/drivers"
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "#6b7280",
            marginBottom: "1rem",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeftIcon style={{ width: "16px", marginRight: "0.25rem" }} />
          Back to Drivers
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
            }}
          >
            {driver.name}
          </h1>
          <span
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
            }}
          >
            {driver.role}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "2rem",
          display: "flex",
          gap: "2rem",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 0",
                // Safe border styling to avoid React hydration/style mismatch warnings
                borderWidth: "0 0 2px 0",
                borderStyle: "solid",
                borderColor: `transparent transparent ${
                  isActive ? "var(--primary-color)" : "transparent"
                } transparent`,
                color: isActive ? "var(--primary-color)" : "#6b7280",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.875rem",
                background: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Icon style={{ width: "18px", height: "18px" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "400px" }}>
        {activeTab === "analytics" && (
          <div>
            {/* Pass driver as an array for DriverAnalytics */}
            <DriverAnalytics drivers={[{ ...driver, trips: trips }]} />
          </div>
        )}

        {activeTab === "details" && <DriverDetails driver={driver} />}

        {activeTab === "documents" && (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              border: "1px dashed #d1d5db",
              color: "#6b7280",
            }}
          >
            <ClipboardDocumentListIcon
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 1rem",
                color: "#9ca3af",
              }}
            />
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              No Documents
            </h3>
            <p>Document management is coming soon.</p>
          </div>
        )}

        {activeTab === "trips" && (
          <div style={{ marginTop: "1rem" }}>
            <TripsTable
              trips={trips}
              totalPages={totalPages}
              currentPage={currentPage}
              totalTripsCount={totalTripsCount}
              routeContractorMap={routeContractorMap}
              searchParams={searchParams}
            />
          </div>
        )}

        {activeTab === "leaves" && (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              border: "1px dashed #d1d5db",
              color: "#6b7280",
            }}
          >
            <CalendarDaysIcon
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 1rem",
                color: "#9ca3af",
              }}
            />
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Leave Management
            </h3>
            <p>Leave tracking for drivers is coming soon.</p>
          </div>
        )}

        {activeTab === "expenses" && (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              border: "1px dashed #d1d5db",
              color: "#6b7280",
            }}
          >
            <BanknotesIcon
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 1rem",
                color: "#9ca3af",
              }}
            />
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Expenses
            </h3>
            <p>Expense tracking for drivers is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
