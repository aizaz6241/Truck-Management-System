"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createContractor(
  formData: FormData,
  documents: { name: string; url: string; type?: string }[],
  materials: string[]
) {
  const name = formData.get("name") as string;
  const abbreviation = (formData.get("abbreviation") as string)?.toUpperCase();
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const licenseNumber = formData.get("licenseNumber") as string;
  const contractStartDate = formData.get("contractStartDate")
    ? new Date(formData.get("contractStartDate") as string)
    : null;
  const contractEndDate = formData.get("contractEndDate")
    ? new Date(formData.get("contractEndDate") as string)
    : null;
  const taxId = formData.get("taxId") as string;
  const poBox = formData.get("poBox") as string;

  try {
    const contractor = await (db as any).contractor.create({
      data: {
        name,
        abbreviation,
        address,
        email: email || null,
        phone,
        licenseNumber,
        contractStartDate,
        contractEndDate,
        taxId,
        poBox,
        documents: {
          create: documents.map((doc) => ({
            name: doc.name,
            url: doc.url,
            type: doc.type || "Contract",
          })),
        },
        materials: {
          create: materials.map((mat) => ({ name: mat })),
        },
      },
    });

    revalidatePath("/admin/contractors");
    return { success: true, data: contractor };
  } catch (error: any) {
    console.error("Error creating contractor:", error);
    return { success: false, error: "Failed to create contractor" };
  }
}

export async function getContractors() {
  try {
    const contractors = await (db as any).contractor.findMany({
      include: {
        documents: true,
        materials: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: contractors };
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return { success: false, error: "Failed to fetch contractors" };
  }
}


export async function getContractorById(id: number) {
  try {
    const contractor = await (db as any).contractor.findUnique({
      where: { id },
      include: {
        documents: true,
        materials: true,
      },
    });
    if (!contractor) return { success: false, error: "Contractor not found" };
    return { success: true, data: contractor };
  } catch (error) {
    console.error("Error fetching contractor:", error);
    return { success: false, error: "Failed to fetch contractor" };
  }
}

export async function updateContractor(
  id: number,
  formData: FormData,
  documents: { name: string; url: string; type?: string }[],
  materials: string[]
) {
  const name = formData.get("name") as string;
  const abbreviation = (formData.get("abbreviation") as string)?.toUpperCase();
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const licenseNumber = formData.get("licenseNumber") as string;
  const contractStartDate = formData.get("contractStartDate")
    ? new Date(formData.get("contractStartDate") as string)
    : null;
  const contractEndDate = formData.get("contractEndDate")
    ? new Date(formData.get("contractEndDate") as string)
    : null;
  const taxId = formData.get("taxId") as string;
  const poBox = formData.get("poBox") as string;

  try {
    // Transaction to update details
    // We will delete existing materials and re-create them to simplify sync
    await (db as any).contractorMaterial.deleteMany({
      where: { contractorId: id },
    });

    const contractor = await (db as any).contractor.update({
      where: { id },
      data: {
        name,
        abbreviation,
        address,
        email: email || null,
        phone,
        licenseNumber,
        contractStartDate,
        contractEndDate,
        taxId,
        poBox,
        documents: {
          create: documents.map((doc) => ({
            name: doc.name,
            url: doc.url,
            type: doc.type || "Contract",
          })),
        },
        materials: {
          create: materials.map((mat) => ({ name: mat })),
        },
      },
    });

    revalidatePath("/admin/contractors");
    return { success: true, data: contractor };
  } catch (error: any) {
    console.error("Error updating contractor:", error);
    return { success: false, error: "Failed to update contractor" };
  }
}

export async function deleteContractor(id: number) {
  try {
    await (db as any).contractor.delete({
      where: { id },
    });
    revalidatePath("/admin/contractors");
    return { success: true };
  } catch (error) {
    console.error("Error deleting contractor:", error);
    return { success: false, error: "Failed to delete contractor" };
  }
}

