  import Link from "next/link";
import { getSites, deleteSite } from "@/lib/actions/site";
import { Site, SiteMaterial, Contractor } from "@/types/prisma";
import ContractorSection from "@/components/ContractorSection";

export default async function SitesPage() {
  const result = await getSites();

  const sites = result.success
    ? (result.data as (Site & {
        materials: SiteMaterial[];
        contractor: Contractor | null;
      })[])
    : [];

  // Group sites by contractor
  const sitesByContractor: Record<string, typeof sites> = {};
  const noContractorSites: typeof sites = [];

  sites.forEach((site) => {
    if (site.contractor) {
      const contractorName = site.contractor.name;
      if (!sitesByContractor[contractorName]) {
        sitesByContractor[contractorName] = [];
      }
      sitesByContractor[contractorName].push(site);
    } else {
      noContractorSites.push(site);
    }
  });

  // Sort contractor names
  const sortedContractors = Object.keys(sitesByContractor).sort();

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
            Site Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage construction sites and routes
          </p>
        </div>
        <Link href="/admin/sites/create" className="btn btn-primary">
          + Add New Site
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {sites.length === 0 ? (
          <div className="card">
            <p
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              No sites found. Add one to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Sites with Contractors */}
            {sortedContractors.map((contractorName) => (
              <ContractorSection
                key={contractorName}
                contractorName={contractorName}
                sites={sitesByContractor[contractorName]}
              />
            ))}

            {/* Sites without Contractors */}
            {noContractorSites.length > 0 && (
              <ContractorSection
                contractorName="Unassigned Sites"
                sites={noContractorSites}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
