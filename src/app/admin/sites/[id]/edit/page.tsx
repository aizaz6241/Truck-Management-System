import SiteForm from "@/components/SiteForm";
import { getSiteById } from "@/lib/actions/site";
import { getContractors } from "@/lib/actions/contractor";
import { notFound } from "next/navigation";
import { Contractor, Site, SiteMaterial } from "@/types/prisma";

interface EditSitePageProps {
  params: {
    id: string;
  };
}

export default async function EditSitePage({ params }: EditSitePageProps) {
  const settings = await params;
  const id = parseInt(settings.id);

  if (isNaN(id)) {
    notFound();
  }

  const [siteResult, contractorsResult] = await Promise.all([
    getSiteById(id),
    getContractors(),
  ]);

  if (!siteResult.success || !siteResult.data) {
    notFound();
  }

  const site = siteResult.data as Site & { materials: SiteMaterial[] };
  const contractors = contractorsResult.success
    ? (contractorsResult.data as Contractor[])
    : [];

  return <SiteForm contractors={contractors} initialData={site} />;
}
