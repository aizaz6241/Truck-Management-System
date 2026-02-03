"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/logger";

export async function deleteTrip(id: number) {
    const session = await getSession();
    if (!session || !session.user) {
        return { message: "Unauthorized" };
    }

    const tripToCheck = await prisma.trip.findUnique({ where: { id } });
    if (!tripToCheck) return { message: "Trip not found" };

    const isDriverOwner = session.user.role === "DRIVER" && tripToCheck.driverId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isDriverOwner && !isAdmin) {
        return { message: "Unauthorized" };
    }

    try {
        await prisma.trip.delete({ where: { id } });

        await logActivity({
            action: "DELETE",
            entity: "TRIP",
            entityId: id,
            details: `Deleted trip from ${tripToCheck.fromLocation} to ${tripToCheck.toLocation}`,
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role,
        });
    } catch (e) {
        return { message: "Failed to delete trip" };
    }

    revalidatePath("/admin/trips");
    revalidatePath("/driver");
}

export async function updateTrip(id: number, prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || !session.user) {
        return { message: "Unauthorized" };
    }

    const tripToCheck = await prisma.trip.findUnique({ where: { id } });
    if (!tripToCheck) return { message: "Trip not found" };

    const isDriverOwner = session.user.role === "DRIVER" && tripToCheck.driverId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isDriverOwner && !isAdmin) {
        return { message: "Unauthorized" };
    }



    const serialNumber = formData.get("serialNumber") as string;
    const fromLocation = formData.get("fromLocation") as string;
    const toLocation = formData.get("toLocation") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const vehicleIdStr = formData.get("vehicleId") as string;
    const materialType = formData.get("materialType") as string;
    const weight = formData.get("weight") as string;
    const companySerialNumber = formData.get("companySerialNumber") as string;

    const paperUrls = formData.getAll("paperUrls") as string[];
    const driverId = parseInt(formData.get("driverId") as string);
    const combinedDateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);

    if (!fromLocation || !toLocation || !dateStr || !vehicleIdStr || !driverId) {
        return { message: "All fields are required" };
    }

    try {
         await prisma.tripImage.deleteMany({ where: { tripId: id } });

        await prisma.trip.update({
            where: { id },
            data: {
                driverId: driverId || undefined,
                vehicleId: parseInt(vehicleIdStr),
                serialNumber: serialNumber || null,
                fromLocation,
                toLocation,
                date: combinedDateTime,
                materialType,
                weight: weight || null,
                companySerialNumber: companySerialNumber || null,
                paperImage: paperUrls[0] || null,
                images: {
                    create: paperUrls.map(url => ({ url }))
                }
            }
        });

        const changes: string[] = [];
        if (tripToCheck.fromLocation !== fromLocation) changes.push(`From: '${tripToCheck.fromLocation}' -> '${fromLocation}'`);
        if (tripToCheck.toLocation !== toLocation) changes.push(`To: '${tripToCheck.toLocation}' -> '${toLocation}'`);
        if (tripToCheck.materialType !== materialType) changes.push(`Material: '${tripToCheck.materialType || 'None'}' -> '${materialType || 'None'}'`);
        if (tripToCheck.vehicleId !== parseInt(vehicleIdStr)) changes.push(`Vehicle ID: ${tripToCheck.vehicleId} -> ${vehicleIdStr}`);
        if (tripToCheck.serialNumber !== serialNumber) changes.push(`Serial Number: '${tripToCheck.serialNumber || 'None'}' -> '${serialNumber || 'None'}'`);
        if (tripToCheck.weight !== weight) changes.push(`Weight: '${tripToCheck.weight || 'None'}' -> '${weight || 'None'}'`);
        if (tripToCheck.companySerialNumber !== companySerialNumber) changes.push(`Company Serial: '${tripToCheck.companySerialNumber || 'None'}' -> '${companySerialNumber || 'None'}'`);

        const details = changes.length > 0 ? `Updated Trip: ${changes.join(", ")}` : "Updated trip details";

        await logActivity({
            action: "UPDATE",
            entity: "TRIP",
            entityId: id,
            details,
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role,
        });
    } catch (e) {
        return { message: "Failed to update trip" };
    }

    revalidatePath("/admin/trips");
    redirect("/admin/trips");
}

export async function createTrip(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || !session.user) {
        return { message: "Unauthorized" };
    }

    const isAdmin = session.user.role === "ADMIN";
    const isDriver = session.user.role === "DRIVER";

    if (!isAdmin && !isDriver) {
        return { message: "Unauthorized" };
    }

    let driverId: number;
    if (isAdmin) {
        const driverIdStr = formData.get("driverId") as string;
        if (!driverIdStr) return { message: "Driver is required" };
        driverId = parseInt(driverIdStr);
    } else {
        driverId = session.user.id;
    }


    const serialNumber = formData.get("serialNumber") as string;
    const fromLocation = formData.get("fromLocation") as string;
    const toLocation = formData.get("toLocation") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const vehicleIdStr = formData.get("vehicleId") as string;
    const materialType = formData.get("materialType") as string;
    const weight = formData.get("weight") as string;
    const companySerialNumber = formData.get("companySerialNumber") as string;

    const paperUrls = formData.getAll("paperUrls") as string[];

    if (!fromLocation || !toLocation || !dateStr || !vehicleIdStr) {
        return { message: "All fields are required" };
    }

    const combinedDateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);
    const vehicleId = parseInt(vehicleIdStr);

    try {
        const trip = await prisma.trip.create({
            data: {
                driverId,
                vehicleId,
                serialNumber: serialNumber || null,
                fromLocation,
                toLocation,
                date: combinedDateTime,
                materialType,
                weight: weight || null,
                companySerialNumber: companySerialNumber || null,
                paperImage: paperUrls[0] || null,
                images: {
                    create: paperUrls.map(url => ({ url }))
                }
            },
        });

        await logActivity({
            action: "CREATE",
            entity: "TRIP",
            entityId: trip.id,
            details: `Created new trip (From: ${fromLocation}, To: ${toLocation})`,
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role,
        });
    } catch (e) {
        console.error(e);
        return { message: "Failed to save trip" };
    }

    if (isAdmin) {
        revalidatePath("/admin/trips");
        redirect("/admin/trips");
    } else {
        redirect("/driver?tripSaved=true");
    }
}

export async function getTripsByRange(startDate: string, endDate: string, ownership: string = "RVT") {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const whereClause: any = {
        date: {
            gte: start,
            lte: end,
        },
    };

    if (ownership !== "All") {
        whereClause.vehicle = {
            ownership: ownership,
        };
    }

    const trips = await prisma.trip.findMany({
        where: whereClause,
        include: {
            vehicle: {
                include: {
                    taxiOwner: true
                }
            },
            driver: true,
        },
        orderBy: {
            date: "desc",
        },
    });

    return trips.map((trip) => ({
        id: trip.id,
        fromLocation: trip.fromLocation,
        toLocation: trip.toLocation,
        vehicle: {
            number: trip.vehicle.number,
            ownership: trip.vehicle.ownership,
            ownerName: trip.vehicle.ownerName,
            taxiOwner: trip.vehicle.taxiOwner ? {
                name: trip.vehicle.taxiOwner.name
            } : null
        },
        driver: {
            name: trip.driver.name,
        },
    }));
}
