"use server";

import { prisma as db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface GalleryDocsFilter {
  startDate?: string;
  endDate?: string;
  contractorId?: string;
  driverId?: string;
  material?: string; // For trip papers
  fromLocation?: string; // For trip papers
  toLocation?: string;   // For trip papers
}

export async function getTripPapers(filters: GalleryDocsFilter) {
  try {
    const where: Prisma.TripWhereInput = {
      // Ensure we only get trips with papers
      // Adjust this condition based on how paperImage is stored (e.g. empty string vs null)
      paperImage: {
        not: null,
        // user might have empty string in db? standard check:
        // notIn: [""] // if current prisma version supports notIn or simple not: ""
      },
    };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters.contractorId) {
      const cId = parseInt(filters.contractorId);
      if (!isNaN(cId)) {
        where.invoice = {
          contractorId: cId,
        };
      }
    }

    if (filters.driverId) {
      const dId = parseInt(filters.driverId);
      if (!isNaN(dId)) {
        where.driverId = dId;
      }
    }

    if (filters.material) {
      where.materialType = {
        contains: filters.material,
      };
    }
  
    if (filters.fromLocation) {
      where.fromLocation = {
        contains: filters.fromLocation,
      };
    }
    
    if (filters.toLocation) {
      where.toLocation = {
        contains: filters.toLocation,
      };
    }

    const trips = await db.trip.findMany({
      where,
      select: {
        id: true,
        date: true,
        paperImage: true,
        fromLocation: true,
        toLocation: true,
        materialType: true,
        driver: {
          select: {
            name: true,
          },
        },
        vehicle: {
          select: {
            number: true,
          }
        },
        invoice: {
          select: {
            contractor: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        date: "desc",
      },
    });

    // Filter out empty strings if prisma 'not: null' let them through
    const validTrips = trips.filter(t => t.paperImage && t.paperImage.trim() !== "");

    return { success: true, data: validTrips };
  } catch (error) {
    console.error("Error fetching trip papers:", error);
    return { success: false, error: "Failed to fetch trip papers" };
  }
}

// And fix getCheques
export async function getCheques(filters: GalleryDocsFilter) {
  try {
    const where: Prisma.PaymentWhereInput = {
      chequeImageUrl: {
        not: null,
      },
    };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters.contractorId) {
      const cId = parseInt(filters.contractorId);
      if (!isNaN(cId)) {
        where.invoice = {
          contractorId: cId,
        };
      }
    }



    const payments = await db.payment.findMany({
      where,
      select: {
        id: true,
        date: true,
        amount: true,
        chequeNo: true,
        chequeImageUrl: true,
        bankName: true,
        invoice: {
          select: {
            invoiceNo: true,
            contractor: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        date: "desc",
      },
    });
    
    const validPayments = payments.filter(p => p.chequeImageUrl && p.chequeImageUrl.trim() !== "");

    return { success: true, data: validPayments };
  } catch (error) {
    console.error("Error fetching cheques:", error);
    return { success: false, error: "Failed to fetch cheques" };
  }
}
