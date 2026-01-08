"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";

export async function updateAdminProfile(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email) {
        return { message: "Name and Email are required" };
    }

    const updateData: any = { name, email };

    if (password) {
        if (password.length < 6) return { message: "Password must be at least 6 characters" };
        if (password !== confirmPassword) return { message: "Passwords do not match" };
        updateData.password = await bcrypt.hash(password, 10);
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        await logActivity({
            action: "UPDATE",
            entity: "USER",
            entityId: session.user.id,
            details: "Updated own admin profile",
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role
        });

        revalidatePath("/admin/settings");
        return { message: "Profile updated successfully", success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { message: "Email already exists" };
        return { message: "Failed to update profile" };
    }
}

export async function createAdmin(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { message: "All fields are required" };
    }

    if (password.length < 6) return { message: "Password must be at least 6 characters" };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN",
                isActive: true
            }
        });

        await logActivity({
            action: "CREATE",
            entity: "USER",
            entityId: newAdmin.id,
            details: `Created new admin: ${name} (${email})`,
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role
        });

        revalidatePath("/admin/settings");
        return { message: "New admin created successfully", success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { message: "Email already exists" };
        return { message: "Failed to create admin" };
    }
}

export async function deleteAdmin(id: number) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    if (session.user.id === id) {
        return { message: "Cannot delete yourself" };
    }

    try {
        const deletedUser = await prisma.user.delete({ where: { id } });

        await logActivity({
            action: "DELETE",
            entity: "USER",
            entityId: id,
            details: `Deleted admin: ${deletedUser.name} (${deletedUser.email})`,
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role
        });

        revalidatePath("/admin/settings");
        return { message: "Admin deleted successfully", success: true };
    } catch (e) {
        return { message: "Failed to delete admin" };
    }
}

export async function updateAdmin(id: number, prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email) {
        return { message: "Name and Email are required" };
    }

    const updateData: any = { name, email };

    if (password && password.trim() !== "") {
        if (password.length < 6) return { message: "Password must be at least 6 characters" };
        updateData.password = await bcrypt.hash(password, 10);
    }

    try {
        await prisma.user.update({
            where: { id },
            data: updateData
        });

        await logActivity({
            action: "UPDATE",
            entity: "USER",
            entityId: id,
            details: `Updated admin profile: ${name} (${email})`,
            actorId: session.user.id,
            actorName: session.user.name || "Unknown",
            actorRole: session.user.role
        });

        revalidatePath("/admin/settings");
        return { message: "Admin updated successfully", success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { message: "Email already exists" };
        return { message: "Failed to update admin" };
    }
}
