"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
        await prisma.vehicle.create({
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
        await prisma.vehicle.delete({ where: { id } });
    } catch (e) {
        console.error("Failed to delete vehicle:", e);
        // Could return error status, but for a simple button we might just revalidate
    }
    revalidatePath("/admin");
    revalidatePath("/admin/vehicles");
}
