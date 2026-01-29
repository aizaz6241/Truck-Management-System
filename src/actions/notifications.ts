"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface NotificationItem {
    id: string; // "contract-123" or "vehicle-456"
    type: "CONTRACT_EXPIRY" | "VEHICLE_REGISTRATION";
    message: string;
    details: any;
    date: Date; // Expiry date
}

export async function getAdminNotifications(): Promise<NotificationItem[]> {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") return [];

    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);

    // 1. Check expiring contracts
    const expiringContracts = await prisma.contractor.findMany({
        where: {
            contractEndDate: {
                lte: oneWeekFromNow,
                gte: today // Not already expired? Or just show all upcoming/recent expired?
                // User said "give notification 1 week before the expiry".
                // Let's show anything expiring within the next 7 days, and maybe recently expired?
                // Let's stick to future expiry within 7 days for now.
            },
            status: "Active"
        }
    });

    // 2. Check expiring vehicle registrations
    const expiringVehicles = await prisma.vehicle.findMany({
        where: {
            registrationExpiry: {
                lte: oneWeekFromNow,
                gte: today
            },
            status: "Active"
        }
    });

    const notifications: NotificationItem[] = [];

    expiringContracts.forEach(c => {
        notifications.push({
            id: `contract-${c.id}`,
            type: "CONTRACT_EXPIRY",
            message: `Contract for ${c.name} is expiring soon`,
            details: c,
            date: c.contractEndDate!
        });
    });

    expiringVehicles.forEach(v => {
        notifications.push({
            id: `vehicle-${v.id}`,
            type: "VEHICLE_REGISTRATION",
            message: `Registration for ${v.number} (${v.model}) is expiring soon`,
            details: v,
            date: v.registrationExpiry!
        });
    });

    // Sort by date soonest
    return notifications.sort((a, b) => a.date.getTime() - b.date.getTime());
}
