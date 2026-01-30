"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSite(
  name: string,
  materials: {
    name: string;
    price: number;
    unit: string;
    locationFrom: string;
    locationTo: string;
  }[],
  contractorId?: number
) {
  try {
    const site = await (db as any).site.create({
      data: {
        name,
        contractorId: contractorId || null,
        materials: {
          create: materials,
        },
      },
    });
    revalidatePath("/admin/sites");
    return { success: true, data: site };
  } catch (error: any) {
    console.error("Error creating site:", error);
    return { success: false, error: error.message || "Failed to create site" };
  }
}

export async function getSites() {
  try {
    const sites = await (db as any).site.findMany({
      include: {
        materials: true,
        contractor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: sites };
  } catch (error) {
    console.error("Error fetching sites:", error);
    return { success: false, error: (error as Error).message || "Failed to fetch sites" };
  }
}

export async function deleteSite(id: number) {
  try {
    await (db as any).site.delete({
      where: { id },
    });
    revalidatePath("/admin/sites");
    return { success: true };
  } catch (error) {
    console.error("Error deleting site:", error);
    return { success: false, error: (error as Error).message || "Failed to delete site" };
  }
}

export async function getSiteById(id: number) {
  try {
    const site = await (db as any).site.findUnique({
      where: { id },
      include: {
        materials: true,
        contractor: true,
      },
    });
    if (!site) return { success: false, error: "Site not found" };
    return { success: true, data: site };
  } catch (error) {
    console.error("Error fetching site:", error);
    return { success: false, error: (error as Error).message || "Failed to fetch site" };
  }
}

export async function updateSite(
  id: number,
  name: string,
  materials: {
    id?: number;
    name: string;
    price: number;
    unit: string;
    locationFrom: string;
    locationTo: string;
  }[],
  contractorId?: number
) {
  try {
    // 1. Update basic site info
    await (db as any).site.update({
      where: { id },
      data: {
        name,
        contractorId: contractorId || null,
      },
    });

    // 2. Handle materials
    // Strategy: Delete all existing materials and recreate them.
    // This is simpler than handling updates/creates/deletes individually
    // for this use case, provided we don't need to preserve material IDs for other relations (which we don't seem to).
    
    // However, looking at the code, it seems safer to delete and recreate 
    // to ensure the state matches exactly what the user sees.
    
    // First, delete existing materials
    await (db as any).siteMaterial.deleteMany({
      where: { siteId: id },
    });

    // Then create the new ones
    // SQLite does not support createMany, so we use a transaction of create calls
    await (db as any).$transaction(
      materials.map((m) =>
        (db as any).siteMaterial.create({
          data: {
            siteId: id,
            name: m.name,
            price: m.price,
            unit: m.unit,
            locationFrom: m.locationFrom,
            locationTo: m.locationTo,
          },
        })
      )
    );

    revalidatePath("/admin/sites");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating site:", error);
    return { success: false, error: error.message || "Failed to update site" };
  }
}
