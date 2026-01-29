import { prisma } from "../src/lib/db";

async function main() {
    const trips = await prisma.trip.findMany({
        where: { id: { in: [2, 3, 4] } }
    });
    console.log(JSON.stringify(trips, null, 2));
}

main();
