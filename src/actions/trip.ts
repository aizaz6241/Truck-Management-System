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
        // File deletion from UploadThing (optional/advanced: call UT API to delete)
        // For now, we just delete the record. Cloud files can remain or be cleaned up by UT retention policy.

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

    const fromLocation = formData.get("fromLocation") as string;
    const toLocation = formData.get("toLocation") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const vehicleIdStr = formData.get("vehicleId") as string;
    const materialType = formData.get("materialType") as string;

    // Read URL from hidden input
    const paperUrl = formData.get("paperUrl") as string;

    const driverId = parseInt(formData.get("driverId") as string);

    // Combine Date and Time
    const combinedDateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);

    if (!fromLocation || !toLocation || !dateStr || !vehicleIdStr || !driverId) {
        return { message: "All fields are required" };
    }

    try {
        await prisma.trip.update({
            where: { id },
            data: {
                driverId: driverId || undefined,
                vehicleId: parseInt(vehicleIdStr),
                fromLocation,
                toLocation,
                date: combinedDateTime,
                materialType,
                ...(paperUrl ? { paperImage: paperUrl } : {})
            }
        });

        const changes: string[] = [];
        if (tripToCheck.fromLocation !== fromLocation) changes.push(`From: '${tripToCheck.fromLocation}' -> '${fromLocation}'`);
        if (tripToCheck.toLocation !== toLocation) changes.push(`To: '${tripToCheck.toLocation}' -> '${toLocation}'`);
        if (tripToCheck.materialType !== materialType) changes.push(`Material: '${tripToCheck.materialType || 'None'}' -> '${materialType || 'None'}'`);
        if (tripToCheck.vehicleId !== parseInt(vehicleIdStr)) changes.push(`Vehicle ID: ${tripToCheck.vehicleId} -> ${vehicleIdStr}`);

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

    const fromLocation = formData.get("fromLocation") as string;
    const toLocation = formData.get("toLocation") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const vehicleIdStr = formData.get("vehicleId") as string;
    const materialType = formData.get("materialType") as string;

    // Read URL from hidden input
    const paperUrl = formData.get("paperUrl") as string;

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
                fromLocation,
                toLocation,
                date: combinedDateTime,
                materialType,
                paperImage: paperUrl || null
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
