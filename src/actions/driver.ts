"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function createDriver(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const cnic = formData.get("cnic") as string;
    const salary = formData.get("salary") as string;

    if (!name || !email || !password) {
        return { message: "Name, Email and Password are required" };
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { message: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const driver = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "DRIVER",
                phone,
                cnic,
                salary
            },
        });

        const session = await getSession();
        if (session?.user) {
            await logActivity({
                action: "CREATE",
                entity: "DRIVER",
                entityId: driver.id,
                details: `Created driver ${name} (${email})`,
                actorId: session.user.id,
                actorName: session.user.name || "Unknown",
                actorRole: session.user.role,
            });
        }
    } catch (e) {
        console.error(e);
        return { message: "Failed to create driver" };
    }

    revalidatePath("/admin/drivers");
    redirect("/admin/drivers");
}

export async function updateDriver(id: number, prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const cnic = formData.get("cnic") as string;
    const salary = formData.get("salary") as string;
    const status = formData.get("status") as string; // Active/Inactive

    const isActive = status === "Active";

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name,
                phone,
                cnic,
                salary,
                isActive
            }
        });

        const session = await getSession();
        if (session?.user) {
            await logActivity({
                action: "UPDATE",
                entity: "DRIVER",
                entityId: id,
                details: `Updated driver ${name}`,
                actorId: session.user.id,
                actorName: session.user.name || "Unknown",
                actorRole: session.user.role,
            });
        }
    } catch (e) {
        return { message: "Failed to update driver" };
    }

    revalidatePath("/admin/drivers");
    redirect("/admin/drivers");
}

export async function deleteDriver(id: number) {
    try {
        const driver = await prisma.user.findUnique({ where: { id } });
        await prisma.user.delete({ where: { id } });

        const session = await getSession();
        if (session?.user) {
            await logActivity({
                action: "DELETE",
                entity: "DRIVER",
                entityId: id,
                details: `Deleted driver ${driver?.name}`,
                actorId: session.user.id,
                actorName: session.user.name || "Unknown",
                actorRole: session.user.role,
            });
        }
    } catch (e) {
        console.error("Failed to delete driver:", e);
    }
    revalidatePath("/admin");
    revalidatePath("/admin/drivers");
}
