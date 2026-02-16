"use client";

import Link from "next/link";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";

interface VehicleCardProps {
  vehicle: {
    id: number;
    number: string;
    type: string;
    status: string;
    ownership: string;
    ownerName: string | null;
    capacity: string | null;
    registrationExpiry: Date | string | null;
  };
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  let daysRemaining: number | null = null;
  let isExpired = false;
  let nearExpiry = false;

  if (vehicle.registrationExpiry) {
    const now = new Date();
    const expiry = new Date(vehicle.registrationExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) isExpired = true;
    else if (daysRemaining <= 30) nearExpiry = true;
  }

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        borderRadius: "0.5rem",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        backgroundColor: "white",
        border: isExpired
          ? "1px solid #fecaca"
          : "1px solid var(--border-color)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
      }}
    >
      {/* Card Header: Number & Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "var(--foreground-color)",
            }}
          >
            {vehicle.number}
          </h3>
          <span
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            {vehicle.type}
          </span>
        </div>
        <span
          style={{
            padding: "0.25rem 0.6rem",
            borderRadius: "9999px",
            backgroundColor:
              vehicle.status === "Active" ? "#d1fae5" : "#fee2e2",
            color: vehicle.status === "Active" ? "#065f46" : "#991b1b",
            fontSize: "0.75rem",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          {vehicle.status}
        </span>
      </div>

      {/* Card Body: Details */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "#6b7280" }}>Ownership:</span>
          <span
            style={{
              fontWeight: "500",
              color:
                vehicle.ownership === "RVT"
                  ? "var(--primary-color)"
                  : "#d97706",
            }}
          >
            {vehicle.ownership}
          </span>
        </div>

        {vehicle.ownership === "Taxi" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ color: "#6b7280" }}>Owner:</span>
            <span style={{ fontWeight: "500" }}>{vehicle.ownerName}</span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "#6b7280" }}>Capacity:</span>
          <span>{vehicle.capacity}</span>
        </div>

        <div
          style={{
            marginTop: "0.5rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            License Expiry
          </div>
          {vehicle.registrationExpiry ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.875rem" }}>
                {new Date(vehicle.registrationExpiry).toLocaleDateString(
                  "en-GB",
                )}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: nearExpiry || isExpired ? "bold" : "normal",
                  color: isExpired
                    ? "#ef4444"
                    : nearExpiry
                      ? "#f59e0b"
                      : "#10b981",
                }}
              >
                {isExpired ? "EXPIRED" : `${daysRemaining} days left`}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
              Not Set
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end", // Align actions to right
          gap: "0.75rem",
          marginTop: "auto",
        }}
      >
        {/* Link wrapper for whole card click - using absolute positioning to cover card but let buttons be clickable */}
        <Link
          href={`/admin/vehicles/${vehicle.id}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
          aria-label={`View details for ${vehicle.number}`}
        />

        {/* Buttons need higher z-index to be clickable over the card link */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <Link
            href={`/admin/vehicles/${vehicle.id}`}
            className="btn"
            style={{
              padding: "0.375rem 0.75rem",
              fontSize: "0.875rem",
              backgroundColor: "var(--primary-color)", // Or specific color
              color: "white",
              textDecoration: "none",
              borderRadius: "0.375rem",
            }}
          >
            Profile
          </Link>
          <div
            onClick={(e) => {
              // Prevent card click from firing when clicking delete
              e.stopPropagation();
            }}
          >
            <DeleteVehicleButton id={vehicle.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
