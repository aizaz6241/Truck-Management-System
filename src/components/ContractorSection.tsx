"use client";

import { useState } from "react";
import { Site, SiteMaterial } from "@/types/prisma";
import { deleteSite } from "@/lib/actions/site";

interface ContractorSectionProps {
  contractorName: string;
  sites: (Site & { materials: SiteMaterial[] })[];
}

export default function ContractorSection({
  contractorName,
  sites,
}: ContractorSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          borderBottom: isOpen ? "1px solid var(--border-color)" : "none",
        }}
      >
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--primary-color)",
          }}
        >
          {contractorName}
        </span>
        <span style={{ fontSize: "1.25rem", color: "var(--text-secondary)" }}>
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            padding: "1.5rem",
            display: "grid",
            gap: "1.5rem",
            backgroundColor: "#f9fafb",
          }}
        >
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}

function SiteCard({ site }: { site: Site & { materials: SiteMaterial[] } }) {
  // Group materials by name
  const materialsByName: Record<string, SiteMaterial[]> = {};
  site.materials.forEach((mat) => {
    if (!materialsByName[mat.name]) {
      materialsByName[mat.name] = [];
    }
    materialsByName[mat.name].push(mat);
  });

  const materialNames = Object.keys(materialsByName).sort();

  return (
    <div
      className="card"
      style={{ border: "1px solid var(--border-color)", boxShadow: "none" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {site.name}
          </h3>
          <div style={{ marginTop: "0.25rem" }}>
            <span
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                backgroundColor:
                  site.status === "Active" ? "#dcfce7" : "#fee2e2",
                color: site.status === "Active" ? "#166534" : "#991b1b",
                fontWeight: "600",
              }}
            >
              {site.status}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <a
            href={`/admin/sites/${site.id}/edit`}
            className="btn"
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
            title="Edit Site"
          >
            Edit
          </a>
          <form
            action={async () => {
              await deleteSite(site.id);
            }}
          >
            <button
              type="submit"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                transition: "background-color 0.2s",
              }}
              title="Delete Site"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <div>
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            marginBottom: "1rem",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Materials & Routes
        </h4>

        {materialNames.length === 0 ? (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              fontStyle: "italic",
            }}
          >
            No materials added.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {materialNames.map((matName) => (
              <div
                key={matName}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "var(--background-color)",
                    padding: "0.75rem 1rem",
                    fontWeight: "700",
                    color: "var(--primary-color)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  {matName}
                </div>
                <div>
                  {materialsByName[matName].map((mat, index) => (
                    <div
                      key={mat.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem 1rem",
                        borderBottom:
                          index < materialsByName[matName].length - 1
                            ? "1px solid var(--border-color)"
                            : "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {mat.locationFrom}
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          →
                        </span>
                        <span style={{ fontWeight: "500" }}>
                          {mat.locationTo}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong>${mat.price.toFixed(2)}</strong>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            marginLeft: "0.25rem",
                          }}
                        >
                          / {mat.unit.replace("Per ", "")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
