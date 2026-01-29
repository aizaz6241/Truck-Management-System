import { getCheques } from "@/actions/gallery";
import ImageGallery from "@/components/gallery/ImageGallery";
import { getContractors } from "@/lib/actions/contractor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cheques | Admin",
};

export default async function ChequesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const filters = {
    startDate: resolvedParams.startDate,
    endDate: resolvedParams.endDate,
    contractorId: resolvedParams.contractorId,
  };

  const { data: cheques } = await getCheques(filters);
  const { data: contractors } = await getContractors();

  const images = (cheques || []).map((cheque) => ({
    id: cheque.id,
    url: cheque.chequeImageUrl!,
    title: `Cheque #${cheque.chequeNo || "N/A"} - ${cheque.invoice.contractor.name}`,
    subtitle: `Amount: ${cheque.amount} - Bank: ${cheque.bankName || "N/A"}`,
    date: cheque.date,
  }));

  const contractorOptions = (contractors || []).map(
    (c: { id: number; name: string }) => ({
      id: c.id,
      name: c.name,
    }),
  );

  return (
    <ImageGallery
      title="Cheques"
      images={images}
      filterProps={{
        showContractor: true,
        showDriver: false,
        showMaterial: false,
        showLocation: false,
        contractors: contractorOptions,
      }}
    />
  );
}
