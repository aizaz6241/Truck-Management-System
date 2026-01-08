"use server";

import { prisma } from "@/lib/db";

export type FilterType = "today" | "7d" | "30d" | "6m" | "1y" | "date" | "month" | "year";

export async function getPieStats(filterType: FilterType, dateParam?: string) {
    let startDate = new Date();
    let endDate = new Date();

    // Reset endpoints
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (filterType === "today") {
        // Already set to today
    } else if (filterType === "7d") {
        startDate.setDate(startDate.getDate() - 7);
    } else if (filterType === "30d") {
        startDate.setDate(startDate.getDate() - 30);
    } else if (filterType === "6m") {
        startDate.setMonth(startDate.getMonth() - 6);
    } else if (filterType === "1y") {
        startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (filterType === "date" && dateParam) {
        startDate = new Date(dateParam);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(dateParam);
        endDate.setHours(23, 59, 59, 999);
    } else if (filterType === "month" && dateParam) {
        // dateParam format: "YYYY-MM"
        const [year, month] = dateParam.split("-").map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0); // Last day of month
        endDate.setHours(23, 59, 59, 999);
    } else if (filterType === "year" && dateParam) {
        const year = parseInt(dateParam);
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        endDate.setHours(23, 59, 59, 999);
    }

    const trips = await prisma.trip.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: { vehicle: true }
    });

    const rvt = trips.filter(t => t.vehicle.ownership === "RVT").length;
    const taxi = trips.filter(t => t.vehicle.ownership === "Taxi").length;

    return { rvt, taxi, total: trips.length };
}
