"use client";

import Link from "next/link";
import DeleteDriverButton from "@/components/DeleteDriverButton";

interface DriverCardProps {
  driver: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    salary: number | string | null;
    isActive: boolean;
  };
}

export default function DriverCard({ driver }: DriverCardProps) {
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
        border: "1px solid var(--border-color)",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
    >
      {/* Card Header: Name & Status */}
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
            {driver.name}
          </h3>
          <span
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            {driver.email} // Displaying email as subtitle
          </span>
        </div>
        <span
          style={{
            padding: "0.25rem 0.6rem",
            borderRadius: "9999px",
            backgroundColor: driver.isActive ? "#d1fae5" : "#fee2e2",
            color: driver.isActive ? "#065f46" : "#991b1b",
            fontSize: "0.75rem",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          {driver.isActive ? "Active" : "Disabled"}
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
          <span style={{ color: "#6b7280" }}>Phone:</span>
          <span style={{ fontWeight: "500" }}>{driver.phone || "-"}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "#6b7280" }}>Salary:</span>
          <span style={{ fontWeight: "500" }}>
            {driver.salary
              ? typeof driver.salary === "number"
                ? driver.salary.toLocaleString()
                : driver.salary
              : "-"}
          </span>
        </div>
      </div>

      {/* Card Footer: Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          marginTop: "auto",
        }}
      >
        {/* Link wrapper for whole card click */}
        <Link
          href={`/admin/drivers/${driver.id}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
          aria-label={`View details for ${driver.name}`}
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
            href={`/admin/drivers/${driver.id}`}
            className="btn"
            style={{
              padding: "0.375rem 0.75rem",
              fontSize: "0.875rem",
              backgroundColor: "var(--primary-color)",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.375rem",
            }}
          >
            Profile
          </Link>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DeleteDriverButton id={driver.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
