"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTaxiOwners() {
  try {
    const owners = await prisma.taxiOwner.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { vehicles: true } } },
    });
    return { success: true, data: owners };
  } catch (error) {
    console.error("Error fetching taxi owners:", error);
    return { success: false, error: "Failed to fetch taxi owners" };
  }
}

export async function createTaxiOwner(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const emiratesId = formData.get("emiratesId") as string;

    if (!name) {
      return { message: "Name is required" };
    }

    await prisma.taxiOwner.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        emiratesId: emiratesId || null,
      },
    });

    revalidatePath("/admin/fleet/taxi-owners");
    return { message: "Taxi owner created successfully", success: true };
  } catch (error) {
    console.error("Error creating taxi owner:", error);
    return { message: "Failed to create taxi owner" };
  }
}

export async function updateTaxiOwner(
  id: number,
  prevState: any,
  formData: FormData,
) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const emiratesId = formData.get("emiratesId") as string;

    if (!name) {
      return { message: "Name is required" };
    }

    await prisma.taxiOwner.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        emiratesId: emiratesId || null,
      },
    });

    revalidatePath("/admin/fleet/taxi-owners");
    return { message: "Taxi owner updated successfully", success: true };
  } catch (error) {
    console.error("Error updating taxi owner:", error);
    return { message: "Failed to update taxi owner" };
  }
}

export async function deleteTaxiOwner(id: number) {
  try {
    await prisma.taxiOwner.delete({
      where: { id },
    });
    revalidatePath("/admin/fleet/taxi-owners");
    return { success: true };
  } catch (error) {
    console.error("Error deleting taxi owner:", error);
    return { success: false, error: "Failed to delete taxi owner" };
  }
}
