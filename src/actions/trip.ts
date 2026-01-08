"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
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
        const trip = await prisma.trip.findUnique({ where: { id } });
        if (trip && trip.paperImage) {
            // Try to delete the file
            const filePath = path.join(process.cwd(), "public", trip.paperImage);
            if (existsSync(filePath)) {
                await unlink(filePath).catch(e => console.error("Failed to delete file:", e));
            }
        }

        await prisma.trip.delete({ where: { id } });

        await logActivity({
            action: "DELETE",
            entity: "TRIP",
            entityId: id,
            details: `Deleted trip from ${trip?.fromLocation} to ${trip?.toLocation}`,
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

    // Check for 'paper' file (new upload)
    const paperFile = formData.get("paper") as File; // Standard upload
    // Optional: add paperCamera check if needed for update too, though Admin usually uploads from file.

    const driverId = parseInt(formData.get("driverId") as string);

    // Combine Date and Time
    const combinedDateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);

    if (!fromLocation || !toLocation || !dateStr || !vehicleIdStr || !driverId) {
        return { message: "All fields are required" };
    }

    let paperPath = undefined;
    if (paperFile && paperFile.size > 0) {
        try {
            const buffer = Buffer.from(await paperFile.arrayBuffer());
            const filename = `${Date.now()}-${paperFile.name.replace(/\s/g, '_')}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            paperPath = `/uploads/${filename}`;

            // Note: Could delete old file here if strict cleanup needed
        } catch (e) {
            console.error("File upload failed:", e);
        }
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
                ...(paperPath ? { paperImage: paperPath } : {})
            }
        });

        const changes: string[] = [];
        if (tripToCheck.fromLocation !== fromLocation) changes.push(`From: '${tripToCheck.fromLocation}' -> '${fromLocation}'`);
        if (tripToCheck.toLocation !== toLocation) changes.push(`To: '${tripToCheck.toLocation}' -> '${toLocation}'`);
        if (tripToCheck.materialType !== materialType) changes.push(`Material: '${tripToCheck.materialType || 'None'}' -> '${materialType || 'None'}'`);
        if (tripToCheck.vehicleId !== parseInt(vehicleIdStr)) changes.push(`Vehicle ID: ${tripToCheck.vehicleId} -> ${vehicleIdStr}`);
        if (tripToCheck.driverId !== driverId) changes.push(`Driver ID: ${tripToCheck.driverId} -> ${driverId}`);
        // Date comparison (simplified)
        if (tripToCheck.date.toISOString() !== combinedDateTime.toISOString()) {
            changes.push(`Date: ${tripToCheck.date.toLocaleString()} -> ${combinedDateTime.toLocaleString()}`);
        }

        const details = changes.length > 0 ? `Updated Trip: ${changes.join(", ")}` : "Updated trip details (no significant changes detected)";

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
    const timeStr = formData.get("time") as string; // "HH:MM"
    const vehicleIdStr = formData.get("vehicleId") as string;
    const materialType = formData.get("materialType") as string;

    // Check both standard 'paper' and 'paperCamera'
    let paperFile = formData.get("paper") as File;
    if (!paperFile || paperFile.size === 0) {
        paperFile = formData.get("paperCamera") as File;
    }

    if (!fromLocation || !toLocation || !dateStr || !vehicleIdStr) {
        return { message: "All fields are required" };
    }

    // Combine Date and Time
    const combinedDateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);

    let paperPath = null;
    if (paperFile && paperFile.size > 0) {
        try {
            const buffer = Buffer.from(await paperFile.arrayBuffer());
            const filename = `${Date.now()}-${paperFile.name.replace(/\s/g, '_')}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            await writeFile(path.join(uploadDir, filename), buffer);
            paperPath = `/uploads/${filename}`;
        } catch (e) {
            console.error("File upload failed:", e);
        }
    }

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
                paperImage: paperPath
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
