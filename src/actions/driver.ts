"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

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
        await prisma.user.create({
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
    } catch (e) {
        return { message: "Failed to update driver" };
    }

    revalidatePath("/admin/drivers");
    redirect("/admin/drivers");
}

export async function deleteDriver(id: number) {
    try {
        await prisma.user.delete({ where: { id } });
    } catch (e) {
        console.error("Failed to delete driver:", e);
    }
    revalidatePath("/admin");
    revalidatePath("/admin/drivers");
}
