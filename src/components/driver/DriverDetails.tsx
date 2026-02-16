"use client";

interface DriverDetailsProps {
  driver: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    cnic: string | null;
    salary: string | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

export default function DriverDetails({ driver }: DriverDetailsProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "0.5rem",
        padding: "2rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "0.5rem",
            }}
          >
            Driver Information
          </h2>
          <p style={{ color: "#6b7280" }}>
            Personal and employment details for {driver.name}
          </p>
        </div>
        <span
          style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            fontWeight: 500,
            backgroundColor: driver.isActive ? "#dcfce7" : "#fee2e2",
            color: driver.isActive ? "#166534" : "#991b1b",
          }}
        >
          {driver.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "2rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Phone Number
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {driver.phone || "N/A"}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Email Address
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {driver.email || "N/A"}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            CNIC / ID
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {driver.cnic || "N/A"}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Salary / Wage
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {driver.salary ? `AED ${driver.salary}` : "N/A"}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Joined Date
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {formatDate(driver.createdAt)}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Role
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {driver.role}
          </div>
        </div>
      </div>
    </div>
  );
}
