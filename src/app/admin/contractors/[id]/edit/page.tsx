import ContractorForm from "@/components/ContractorForm";
import { getContractorById } from "@/lib/actions/contractor";
import { notFound } from "next/navigation";
import { Contractor, ContractorDocument } from "@/types/prisma";

// We need to handle the params properly in Next.js 15/16
// params is a Promise in newer versions
type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditContractorPage({ params }: Props) {
  const { id } = await params;
  const contractorId = parseInt(id);

  if (isNaN(contractorId)) {
    return notFound();
  }

  const result = await getContractorById(contractorId);

  if (!result.success || !result.data) {
    return notFound(); // Or handle error gracefully
  }

  // Cast properly. The server action returns (db as any) result which is broadly typed.
  // We know it matches our interface.
  const contractor = result.data as unknown as Contractor & {
    documents: ContractorDocument[];
  };

  return <ContractorForm initialData={contractor} />;
}
