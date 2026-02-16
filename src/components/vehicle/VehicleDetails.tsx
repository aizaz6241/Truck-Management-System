"use client";

import { useState } from "react";
import { Vehicle } from "@prisma/client";

interface VehicleDetailsProps {
  vehicle: any; // Using any for now to include relations if needed, but primarily Vehicle fields
}

export default function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          color: "#1f2937",
        }}
      >
        Vehicle Information
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Vehicle Number
          </label>
          <div
            style={{ fontSize: "1rem", color: "#111827", fontWeight: "500" }}
          >
            {vehicle.number}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Type
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {vehicle.type}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Model
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {vehicle.model}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Capacity
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {vehicle.capacity}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Ownership
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            <span
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                backgroundColor:
                  vehicle.ownership === "RVT" ? "#eff6ff" : "#fff7ed",
                color: vehicle.ownership === "RVT" ? "#1d4ed8" : "#c2410c",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {vehicle.ownership}
            </span>
          </div>
        </div>

        {vehicle.ownership === "Taxi" && vehicle.taxiOwner && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              Taxi Owner
            </label>
            <div style={{ fontSize: "1rem", color: "#111827" }}>
              {vehicle.taxiOwner.name}
            </div>
          </div>
        )}

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Registration Expiry
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            {vehicle.registrationExpiry
              ? new Date(vehicle.registrationExpiry).toLocaleDateString()
              : "-"}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Status
          </label>
          <div style={{ fontSize: "1rem", color: "#111827" }}>
            <span
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "9999px",
                backgroundColor:
                  vehicle.status === "Active" ? "#dcfce7" : "#fee2e2",
                color: vehicle.status === "Active" ? "#15803d" : "#b91c1c",
                fontSize: "0.75rem",
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              {vehicle.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
