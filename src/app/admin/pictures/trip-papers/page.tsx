import { getTripPapers } from "@/actions/gallery";
import GalleryFilter from "@/components/gallery/GalleryFilter";
import TripPaperCard from "@/components/gallery/TripPaperCard";
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
    <div className="container" style={{ padding: "1rem" }}>
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}
      >
        Trip Papers
      </h1>

      <GalleryFilter
        showContractor={true}
        showDriver={true}
        showMaterial={true}
        showLocation={true}
        contractors={contractorOptions}
        drivers={driverOptions}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {trips && trips.length > 0 ? (
          trips.map((trip) => <TripPaperCard key={trip.id} trip={trip} />)
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No trip papers found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
