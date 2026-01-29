import { getStatements } from "@/actions/statement";
import { getContractors } from "@/lib/actions/contractor";
import { Metadata } from "next";
import StatementsPageClient from "./StatementsClient";

export const metadata: Metadata = {
  title: "Statements | Admin",
};

export default async function StatementsPage() {
  const { data: statements } = await getStatements();
  const { data: contractors } = await getContractors();

  return (
    <StatementsPageClient
      statements={statements || []}
      contractors={contractors || []}
    />
  );
}
