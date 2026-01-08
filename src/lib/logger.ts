import { prisma } from "@/lib/db";
import { User } from "@prisma/client";

// You might need to adjust how you get the current user depending on your auth setup.
// If you are passing the actor explicitly, that's also fine.

type ActionType = "CREATE" | "UPDATE" | "DELETE";
type EntityType = "TRIP" | "VEHICLE" | "DRIVER" | "USER";

interface LogPars {
    action: ActionType;
    entity: EntityType;
    entityId?: string | number;
    details?: string;
    actorId: number;
    actorName: string;
    actorRole: string;
}

export async function logActivity(params: LogPars) {
    try {
        const { action, entity, entityId, details, actorId, actorName, actorRole } = params;

        await prisma.activityLog.create({
            data: {
                action,
                entity,
                entityId: entityId ? String(entityId) : null,
                details,
                actorId,
                actorName,
                actorRole,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // We don't want to throw here to avoid blocking the main action if logging fails
    }
}
