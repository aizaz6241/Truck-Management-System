import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import TripForm from "@/components/TripForm";

export default async function EditTripPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.user || session.user.role !== "DRIVER") {
        redirect("/login");
    }

    const tripId = parseInt(params.id);
    if (isNaN(tripId)) notFound();

    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { driver: true }
    });

    if (!trip || trip.driverId !== session.user.id) {
        // Only allow editing own trips
        notFound();
    }

    const vehicles = await prisma.vehicle.findMany({
        where: { status: "Active" }
    });

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Edit Trip</h1>
            <TripForm driverName={session.user.name} vehicles={vehicles} initialData={trip} />
        </div>
    );
}
