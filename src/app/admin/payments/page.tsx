import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPayments } from "@/actions/invoice";
import PaymentsTable from "@/components/PaymentsTable";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const payments = await getAllPayments();

  // Serialize dates
  const serializedPayments = payments.map((p: any) => ({
    ...p,
    date: p.date.toISOString(),
    invoice: {
      ...p.invoice,
      trips: p.invoice.trips, // Already simplified in fetch
      // Normalize dates if invoice has them, but we primarily need fields like totalAmount
    },
  }));

  return (
    <div
      className="container"
      style={{ maxWidth: "1200px", margin: "2rem auto" }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1>Payments Record</h1>
        <p style={{ color: "#666" }}>
          List of all payment transactions received.
        </p>
      </div>

      <PaymentsTable initialPayments={serializedPayments} />
    </div>
  );
}
