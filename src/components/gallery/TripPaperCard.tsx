"use client";

import { useState } from "react";
import ViewPaperButton from "@/components/ViewPaperButton";

interface TripPaperCardProps {
  trip: {
    id: number;
    date: Date;
    paperImage: string | null;
    images: { url: string }[];
    fromLocation: string;
    toLocation: string;
    vehicle?: { number: string }; // Optional chaining in case needed
    driver?: { name: string };
    invoice?: { contractor?: { name: string } | null } | null;
  };
}

export default function TripPaperCard({ trip }: TripPaperCardProps) {
  // Combine paperImage and images relation
  const rawImages: string[] = [];
  if (trip.paperImage) rawImages.push(trip.paperImage);
  if (trip.images) {
    trip.images.forEach((img) => rawImages.push(img.url));
  }
  const allImages = Array.from(new Set(rawImages));
  // Deduplicate if needed? Standard case is paperImage stores primary, images relation stores additional.

  if (allImages.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
          borderBottom: "1px solid #eee",
          paddingBottom: "0.5rem",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>
            Trip #{trip.id} -{" "}
            {trip.invoice?.contractor?.name || "Unknown Contractor"}
          </h3>
          <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem" }}>
            {new Date(trip.date).toLocaleDateString()} | {trip.fromLocation} →{" "}
            {trip.toLocation}
          </p>
          <div style={{ fontSize: "0.85rem", color: "#888" }}>
            Driver: {trip.driver?.name || "N/A"} | Vehicle:{" "}
            {trip.vehicle?.number || "N/A"}
          </div>
        </div>
        <div>
          {/* Standard button to open gallery modal seamlessly */}
          <ViewPaperButton
            imageUrl={allImages[0]}
            images={allImages}
            buttonText={`View All (${allImages.length})`}
            className="btn btn-primary btn-sm"
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {allImages.map((url, index) => (
          <div
            key={index}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid #eee",
              cursor: "pointer",
            }}
          >
            {/* Using img for simplicity, next/image requires width/height known */}
            <img
              src={url}
              alt={`Trip ${trip.id} image ${index + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onClick={() => {
                // Open modal logic? Or rely on the main button?
                // Since ViewPaperButton handles the modal state internally, we can't easily trigger it from outside without lifting state.
                // For now, let's just display thumbnails. Ideally clicking one opens the modal at that index.
                // But the user's request is "show in trip papers section under one boundary".
                // Visual thumbnails are good.
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
