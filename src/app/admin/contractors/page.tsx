import Link from "next/link";
import { getContractors, deleteContractor } from "@/lib/actions/contractor";
import { Contractor, ContractorDocument } from "@/types/prisma";
import DocumentViewer from "@/components/DocumentViewer";

export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  const result = await getContractors();
  const contractors = result.success
    ? (result.data as (Contractor & { documents: ContractorDocument[] })[])
    : [];

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
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "var(--text-primary)",
          }}
        >
          Contractor Management
        </h1>
        <Link href="/admin/contractors/create" className="btn btn-primary">
          + Add Contractor
        </Link>
      </div>

      {!result.success && (
        <div className="alert-error">Failed to load contractors</div>
      )}

      <div className="card" style={{ padding: "0" }}>
        <div className="table-responsive">
          <table className="log-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>License No.</th>
                <th>Contract Period</th>
                <th>Status</th>
                <th>Documents</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contractors && contractors.length > 0 ? (
                contractors.map(
                  (
                    contractor: Contractor & {
                      documents: ContractorDocument[];
                    },
                  ) => (
                    <tr key={contractor.id}>
                      <td>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          {contractor.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {contractor.email}
                        </div>
                      </td>
                      <td>{contractor.phone}</td>
                      <td>{contractor.licenseNumber || "-"}</td>
                      <td>
                        <div style={{ fontSize: "0.85rem" }}>
                          {contractor.contractStartDate
                            ? new Date(
                                contractor.contractStartDate,
                              ).toLocaleDateString()
                            : "N/A"}
                          {" - "}
                          {contractor.contractEndDate
                            ? new Date(
                                contractor.contractEndDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`log-badge ${contractor.status === "Active" ? "badge-create" : "badge-default"}`}
                        >
                          {contractor.status}
                        </span>
                      </td>
                      <td>
                        <DocumentViewer documents={contractor.documents} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.5rem",
                          }}
                        >
                          <Link
                            href={`/admin/contractors/${contractor.id}/edit`}
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              backgroundColor: "var(--primary-color)",
                              color: "white",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                            }}
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </Link>

                          <form
                            action={async () => {
                              "use server";
                              await deleteContractor(contractor.id);
                            }}
                          >
                            <button
                              type="submit"
                              style={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                backgroundColor: "var(--danger-color)",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "3rem" }}
                  >
                    <div style={{ color: "var(--text-secondary)" }}>
                      No contractors found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
