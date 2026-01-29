"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface GalleryFilterProps {
  showContractor?: boolean;
  showDriver?: boolean;
  showMaterial?: boolean;
  showLocation?: boolean;
  contractors?: { id: number; name: string }[];
  drivers?: { id: number; name: string }[];
}

export default function GalleryFilter({
  showContractor = true,
  showDriver = true,
  showMaterial = true,
  showLocation = true,
  contractors = [],
  drivers = [],
}: GalleryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "1.5rem",
        padding: "1rem",
        backgroundColor: "var(--background-color)",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            display: "block",
            marginBottom: "0.25rem",
          }}
        >
          From
        </label>
        <input
          type="date"
          className="form-input"
          placeholder="Start Date"
          value={searchParams.get("startDate") ?? ""}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            display: "block",
            marginBottom: "0.25rem",
          }}
        >
          To
        </label>
        <input
          type="date"
          className="form-input"
          placeholder="End Date"
          value={searchParams.get("endDate") ?? ""}
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
        />
      </div>

      {showContractor && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select
            className="form-input"
            value={searchParams.get("contractorId") ?? ""}
            onChange={(e) => handleFilterChange("contractorId", e.target.value)}
          >
            <option value="">All Contractors</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showDriver && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select
            className="form-input"
            value={searchParams.get("driverId") ?? ""}
            onChange={(e) => handleFilterChange("driverId", e.target.value)}
          >
            <option value="">All Drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showMaterial && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Material"
            value={searchParams.get("material") ?? ""}
            onChange={(e) => handleFilterChange("material", e.target.value)}
          />
        </div>
      )}

      {showLocation && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Route (From/To)"
            value={searchParams.get("fromLocation") ?? ""} // using fromLocation as generic route search for simplicity
            onChange={(e) => handleFilterChange("fromLocation", e.target.value)}
          />
        </div>
      )}

      <button
        className="btn"
        onClick={() => {
          startTransition(() => {
            router.replace(pathname);
          });
        }}
        style={{
          height: "42px", // match input height roughly
          alignSelf: "flex-end", // align with inputs
          marginBottom: "0px",
        }}
      >
        Reset Filters
      </button>

      {isPending && (
        <span style={{ alignSelf: "center", color: "var(--text-secondary)" }}>
          Loading...
        </span>
      )}
    </div>
  );
}
