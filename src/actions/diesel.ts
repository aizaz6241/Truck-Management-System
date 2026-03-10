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

export async function addDieselRecords(records: {
  vehicleId: number;
  driverId?: number;
  date: Date;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  odometer?: number;
}[]) {
  try {
    // We use createMany for efficiency if supported, otherwise loop (Prisma createMany is usually fine)
    // However, if we need individual results back (for onSuccess in UI), we might need to do individual creates or a transaction
    const results = await db.$transaction(
      records.map((data) =>
        db.diesel.create({
          data: {
            vehicleId: data.vehicleId,
            driverId: data.driverId,
            date: data.date,
            liters: data.liters,
            pricePerLiter: data.pricePerLiter,
            totalAmount: data.totalAmount,
            odometer: data.odometer,
          },
          include: {
            vehicle: true,
            driver: true,
          },
        })
      )
    );

    revalidatePath("/admin/diesel");
    return { success: true, data: results };
  } catch (error) {
    console.error("Error adding diesel records:", error);
    return { success: false, error: (error as Error).message || "Failed to add records" };
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

export async function bulkUpdateDieselPrices(startDate: Date, endDate: Date, price: number) {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await db.diesel.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    if (records.length === 0) {
      return { success: true, count: 0 };
    }

    const updatePromises = records.map((record) => {
      const newTotal = record.liters * price;
      return db.diesel.update({
        where: { id: record.id },
        data: {
          pricePerLiter: price,
          totalAmount: newTotal,
        },
      });
    });

    await db.$transaction(updatePromises);

    revalidatePath("/admin/diesel");
    return { success: true, count: records.length };
  } catch (error) {
    console.error("Error bulk updating diesel prices:", error);
    return { success: false, error: (error as Error).message || "Failed to update prices" };
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
