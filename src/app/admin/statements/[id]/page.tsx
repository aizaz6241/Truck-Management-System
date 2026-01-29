import { prisma } from "@/lib/db";
import { getStatement } from "@/actions/statement";
import StatementEditor from "@/components/statements/StatementEditor";
import { notFound } from "next/navigation";

export default async function StatementViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const { data: statement } = await getStatement(id);

  if (!statement) {
    notFound();
  }

  let statementData = null;
  try {
    if (statement.details) {
      statementData = JSON.parse(statement.details);
    }
  } catch (e) {
    console.error("Failed to parse statement json", e);
  }

  // Fallback: If contractorId is missing in DB (legacy records), find it by name from JSON details
  let resolvedContractorId = statement.contractorId;
  if (!resolvedContractorId && statementData?.contractorName) {
    const contractor = await prisma.contractor.findFirst({
      where: { name: statementData.contractorName },
    });
    if (contractor) {
      resolvedContractorId = contractor.id;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "32px 0",
      }}
    >
      <div className="container" style={{ padding: "0 16px" }}>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <a
            href="/admin/statements"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "white",
              color: "#374151",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            &larr; Back to Statements
          </a>
        </div>

        {statementData ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StatementEditor
              initialData={statementData}
              statementId={id}
              contractorId={resolvedContractorId || undefined}
              letterhead={statement.letterhead || "RVT"}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Invalid Statement Data
            </div>
            <p>The statement details could not be parsed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
