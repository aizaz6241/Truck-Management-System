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

// Sort by date soonest
    // Filter out dismissed notifications
    // using (prisma as any) because strict typing might be lagging behind the generated client update
    const dismissed = await (prisma as any).dismissedNotification.findMany({
        select: { identifier: true }
    });
    const dismissedIds = new Set(dismissed.map((d: { identifier: string }) => d.identifier));

    const notifications: NotificationItem[] = [];

    expiringContracts.forEach(c => {
        // ID format: type-id-timestamp
        // changing timestamp (new expiry) means new ID -> dismissed note reappears if date changes!
        const id = `contract-${c.id}-${c.contractEndDate?.getTime()}`;
        if (!dismissedIds.has(id)) {
            notifications.push({
                id,
                type: "CONTRACT_EXPIRY",
                message: `Contract for ${c.name} is expiring soon`,
                details: c,
                date: c.contractEndDate!
            });
        }
    });

    expiringVehicles.forEach(v => {
        const id = `vehicle-${v.id}-${v.registrationExpiry?.getTime()}`;
        if (!dismissedIds.has(id)) {
            notifications.push({
                id,
                type: "VEHICLE_REGISTRATION",
                message: `Registration for ${v.number} (${v.model}) is expiring soon`,
                details: v,
                date: v.registrationExpiry!
            });
        }
    });

    // Sort by date soonest
    return notifications.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function dismissNotification(identifier: string) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") return;

    try {
        await (prisma as any).dismissedNotification.create({
            data: {
                identifier,
                userId: session.user.id
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to dismiss notification", error);
        return { success: false };
    }
}
