"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDieselRecords(filters?: {
  startDate?: string;
  endDate?: string;
  vehicleId?: number;
}) {
  try {
    const whereClause: any = {};

    if (filters?.startDate || filters?.endDate) {
      whereClause.date = {};
      if (filters.startDate) whereClause.date.gte = new Date(filters.startDate);
      if (filters.endDate) whereClause.date.lte = new Date(filters.endDate);
    }

    if (filters?.vehicleId) {
      whereClause.vehicleId = filters.vehicleId;
    }

    const records = await db.diesel.findMany({
      where: whereClause,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { date: "desc" },
    });

    return { success: true, data: records };
  } catch (error) {
    console.error("Error fetching diesel records:", error);
    return { success: false, error: "Failed to fetch records" };
  }
}

export async function addDieselRecord(data: {
  vehicleId: number;
  driverId?: number;
  date: Date;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  odometer?: number;
  receiptUrl?: string;
}) {
  try {
    const record = await db.diesel.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        date: data.date,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        totalAmount: data.totalAmount,
        odometer: data.odometer,
        receiptUrl: data.receiptUrl,
      },
    });

    revalidatePath("/admin/diesel");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error adding diesel record:", error);
    return { success: false, error: (error as Error).message || "Failed to add record" };
  }
}

export async function updateDieselRecord(id: number, data: {
  vehicleId: number;
  driverId?: number;
  date: Date;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  odometer?: number;
  receiptUrl?: string;
}) {
  try {
    const record = await db.diesel.update({
      where: { id },
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        date: data.date,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        totalAmount: data.totalAmount,
        odometer: data.odometer,
        receiptUrl: data.receiptUrl,
      },
    });

    revalidatePath("/admin/diesel");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error updating diesel record:", error);
    return { success: false, error: (error as Error).message || "Failed to update record" };
  }
}

export async function deleteDieselRecord(id: number) {
  try {
    await db.diesel.delete({
      where: { id },
    });
    revalidatePath("/admin/diesel");
    return { success: true };
  } catch (error) {
    console.error("Error deleting diesel record:", error);
    return { success: false, error: (error as Error).message || "Failed to delete record" };
  }
}

export async function getDieselStats() {
  try {
    // Current month/year logic could be added here, currently just global total
    const aggregation = await db.diesel.aggregate({
      _sum: {
        liters: true,
        totalAmount: true,
      },
    });

    return {
      success: true,
      data: {
        totalLiters: aggregation._sum.liters || 0,
        totalCost: aggregation._sum.totalAmount || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching diesel stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
