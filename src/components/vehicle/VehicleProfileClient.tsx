"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  ChartBarIcon,
  DocumentTextIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
// Import Components
import VehicleAnalytics from "@/components/VehicleAnalytics";
import VehicleDetails from "./VehicleDetails";
import TripsTable from "@/components/TripsTable";
import DieselList from "@/components/diesel/DieselList";

interface VehicleProfileClientProps {
  vehicle: any;
  trips: any[];
  dieselRecords: any[];
  totalPages: number;
  currentPage: number;
  totalTripsCount: number;
  routeContractorMap: Record<string, { id: number; name: string }>;
  searchParams: any;
}

export default function VehicleProfileClient({
  vehicle,
  trips,
  dieselRecords,
  totalPages,
  currentPage,
  totalTripsCount,
  routeContractorMap,
  searchParams,
}: VehicleProfileClientProps) {
  // Tabs: 'analytics', 'details', 'trips', 'diesel', 'documents', 'maintenance'
  const [activeTab, setActiveTab] = useState("analytics");

  const tabs = [
    { id: "analytics", label: "Analytics", icon: ChartBarIcon },
    { id: "details", label: "Details", icon: DocumentTextIcon },
    { id: "trips", label: "Trips", icon: TruckIcon },
    { id: "diesel", label: "Diesel", icon: BeakerIcon },
    { id: "documents", label: "Documents", icon: ClipboardDocumentListIcon },
    { id: "maintenance", label: "Maintenance", icon: WrenchScrewdriverIcon },
  ];

  return (
    <div className="container" style={{ maxWidth: "98%", marginTop: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/admin/vehicles"
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
          Back to Vehicles
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
            {vehicle.number}
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
            {vehicle.type}
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
                borderWidth: "0 0 2px 0",
                borderStyle: "solid",
                borderColor: `transparent transparent ${isActive ? "var(--primary-color)" : "transparent"} transparent`,
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
            <VehicleAnalytics vehicles={[{ ...vehicle, trips: trips }]} />
          </div>
        )}

        {activeTab === "details" && <VehicleDetails vehicle={vehicle} />}

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

        {activeTab === "diesel" && (
          <DieselList
            initialData={dieselRecords}
            drivers={[]}
            vehicles={[vehicle]}
          />
        )}

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

        {activeTab === "maintenance" && (
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
            <WrenchScrewdriverIcon
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
              Maintenance Log
            </h3>
            <p>Maintenance tracking is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
