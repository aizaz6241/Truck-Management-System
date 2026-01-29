import { getTripPapers } from "@/actions/gallery";
import ImageGallery from "@/components/gallery/ImageGallery";
import { getContractors } from "@/lib/actions/contractor";
import { getDrivers } from "@/actions/driver"; // Assuming we have this or need to create/find it
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip Papers | Admin",
};

export default async function TripPapersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const filters = {
    startDate: resolvedParams.startDate,
    endDate: resolvedParams.endDate,
    contractorId: resolvedParams.contractorId,
    driverId: resolvedParams.driverId,
    material: resolvedParams.material,
    fromLocation: resolvedParams.fromLocation,
    toLocation: resolvedParams.toLocation,
  };

  const { data: trips } = await getTripPapers(filters);
  const { data: contractors } = await getContractors();
  const { data: drivers } = await getDrivers(); // Need to verify if this exists

  const images = (trips || []).map((trip) => ({
    id: trip.id,
    url: trip.paperImage!,
    title: `Trip #${trip.id} - ${trip.invoice?.contractor?.name || "Unknown"}`,
    subtitle: `${trip.fromLocation} to ${trip.toLocation} ending at ${trip.date.toISOString().split("T")[0]}`,
    date: trip.date,
  }));

  // map contractor/driver data for selects
  const contractorOptions = (contractors || []).map(
    (c: { id: number; name: string }) => ({
      id: c.id,
      name: c.name,
    }),
  );

  const driverOptions = (drivers || []).map(
    (d: { id: number; name: string }) => ({
      id: d.id,
      name: d.name,
    }),
  );

  return (
    <ImageGallery
      title="Trip Papers"
      images={images}
      filterProps={{
        showContractor: true,
        showDriver: true,
        showMaterial: true,
        showLocation: true,
        contractors: contractorOptions,
        drivers: driverOptions,
      }}
    />
  );
}
