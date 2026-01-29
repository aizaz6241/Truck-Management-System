import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";

export default async function VehiclesPage(props: {
  searchParams: Promise<{ ownership?: string; status?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const ownershipFilter = searchParams.ownership;
  const statusFilter = searchParams.status;
  const query = searchParams.q;

  const where: any = {};
  if (ownershipFilter) {
    where.ownership = ownershipFilter;
  }
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (query) {
    where.OR = [
      { number: { contains: query } },
      { model: { contains: query } },
      { ownerName: { contains: query } },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const totalVehicles = vehicles.length;

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1>
          Vehicle Management{" "}
          <span
            style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}
          >
            ({totalVehicles} Total)
          </span>
        </h1>
        <Link href="/admin/vehicles/new" className="btn btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {/* Filter */}
      <form
        className="card"
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label className="form-label">Search</label>
          <input
            name="q"
            defaultValue={query}
            className="form-input"
            placeholder="Search Number, Model, Owner..."
          />
        </div>
        <div style={{ width: "150px" }}>
          <label className="form-label">Ownership</label>
          <select
            name="ownership"
            defaultValue={ownershipFilter}
            className="form-select"
          >
            <option value="">All</option>
            <option value="RVT">RVT (Company)</option>
            <option value="Taxi">Taxi (Private)</option>
          </select>
        </div>
        <div style={{ width: "150px" }}>
          <label className="form-label">Status</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="form-select"
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
        <Link
          href="/admin/vehicles"
          className="btn"
          style={{ backgroundColor: "#ccc" }}
        >
          Reset
        </Link>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--background-color)",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Number
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Ownership
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Owner Name
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Capacity
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                License Expiry
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
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
                <tr
                  key={vehicle.id}
                  style={{
                    opacity: isExpired ? 0.6 : 1,
                    backgroundColor: isExpired ? "#fff0f0" : "inherit",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {vehicle.number}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {vehicle.type}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color:
                          vehicle.ownership === "RVT"
                            ? "var(--primary-color)"
                            : "#ffa000",
                      }}
                    >
                      {vehicle.ownership}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {vehicle.ownership === "Taxi" ? vehicle.ownerName : "-"}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {vehicle.capacity}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {vehicle.registrationExpiry ? (
                      <div>
                        <div>
                          {new Date(
                            vehicle.registrationExpiry,
                          ).toLocaleDateString()}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight:
                              nearExpiry || isExpired ? "bold" : "normal",
                            color: isExpired
                              ? "red"
                              : nearExpiry
                                ? "red"
                                : "green",
                          }}
                        >
                          {isExpired ? "EXPIRED" : `${daysRemaining} days left`}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        backgroundColor:
                          vehicle.status === "Active" ? "#d4edda" : "#f8d7da",
                        color:
                          vehicle.status === "Active" ? "#155724" : "#721c24",
                        fontSize: "0.875rem",
                      }}
                    >
                      {vehicle.status}
                    </span>
                    {isExpired && vehicle.status === "Active" && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "red",
                          marginTop: "2px",
                        }}
                      >
                        (Needs Update)
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <Link
                      href={`/admin/vehicles/${vehicle.id}/edit`}
                      style={{
                        marginRight: "1rem",
                        color: "var(--primary-color)",
                      }}
                    >
                      Edit
                    </Link>
                    <DeleteVehicleButton id={vehicle.id} />
                  </td>
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: "1rem", textAlign: "center" }}
                >
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
