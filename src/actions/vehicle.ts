"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function createVehicle(prevState: any, formData: FormData) {
    const number = formData.get("number") as string;
    const type = formData.get("type") as string;
    const model = formData.get("model") as string;
    const capacity = formData.get("capacity") as string;
    const status = formData.get("status") as string;
    const ownership = formData.get("ownership") as string;
    const ownerName = formData.get("ownerName") as string;

    if (!number || !type || !model || !capacity) {
        return { message: "All fields are required" };
    }

    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                number,
                type,
                model,
                capacity,
                status: status || "Active",
                ownership: ownership || "RVT",
                ownerName: ownership === "Taxi" ? ownerName : null
            },
        });

        const session = await getSession();
        if (session?.user) {
            await logActivity({
                action: "CREATE",
                entity: "VEHICLE",
                entityId: vehicle.id,
                details: `Created vehicle ${number} (${type})`,
                actorId: session.user.id,
                actorName: session.user.name || "Unknown",
                actorRole: session.user.role,
            });
        }
    } catch (e) {
        console.error(e);
        return { message: "Failed to create vehicle" };
    }

    revalidatePath("/admin/vehicles");
    redirect("/admin/vehicles");
}

export async function updateVehicle(id: number, prevState: any, formData: FormData) {
    const number = formData.get("number") as string;
    const type = formData.get("type") as string;
    const model = formData.get("model") as string;
    const capacity = formData.get("capacity") as string;
    const status = formData.get("status") as string;
    const ownership = formData.get("ownership") as string;
    const ownerName = formData.get("ownerName") as string;

    try {
        await prisma.vehicle.update({
            where: { id },
            data: {
                number,
                type,
                model,
                capacity,
                status,
                ownership,
                ownerName: ownership === "Taxi" ? ownerName : null
            }
        });

        const session = await getSession();
        if (session?.user) {
            await logActivity({
                action: "UPDATE",
                entity: "VEHICLE",
                entityId: id,
                details: `Updated vehicle ${number}`,
                actorId: session.user.id,
                actorName: session.user.name || "Unknown",
                actorRole: session.user.role,
            });
        }
    } catch (e) {
        return { message: "Failed to update vehicle" };
    }

    revalidatePath("/admin/vehicles");
    redirect("/admin/vehicles");
}

export async function deleteVehicle(id: number) {
    try {
        // Optional: Check dependent records (Trips, Drivers) before deleting?
        // For now, let's assume cascade or just try delete.
        const vehicle = await prisma.vehicle.findUnique({ where: { id } });
        await prisma.vehicle.delete({ where: { id } });

        const session = await getSession();
        if (session?.user) {
            await logActivity({
                action: "DELETE",
                entity: "VEHICLE",
                entityId: id,
                details: `Deleted vehicle ${vehicle?.number}`,
                actorId: session.user.id,
                actorName: session.user.name || "Unknown",
                actorRole: session.user.role,
            });
        }
    } catch (e) {
        console.error("Failed to delete vehicle:", e);
        // Could return error status, but for a simple button we might just revalidate
    }
    revalidatePath("/admin");
    revalidatePath("/admin/vehicles");
}
