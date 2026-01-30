import SiteForm from "@/components/SiteForm";
import { getContractors } from "@/lib/actions/contractor";
import { Contractor } from "@/types/prisma";

export const dynamic = "force-dynamic";

export default async function CreateSitePage() {
  const result = await getContractors();
  // Safe cast or fallback
  const contractors = result.success ? (result.data as Contractor[]) : [];

  return <SiteForm contractors={contractors} />;
}
