// const { getRevenueStats } = require('./src/actions/analytics');

async function testRevenue() {
    console.log("Testing Revenue Stats...");
    // Mock the prisma context or environment if needed, but since we are running via node directly 
    // and actions use 'use server', we might need to be careful. 
    // Actually, running `next` actions directly in node script is hard because of 'use server' and imports.
    // Better to use the same approach as previous script using PrismaClient directly to mimic the logic.
    
    // Let's just re-implement the logic in a script to verify the specific matching logic works on current DB data
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const trips = await prisma.trip.findMany({
        include: { vehicle: true }
    });
    console.log(`Found ${trips.length} total trips.`);

    const materials = await prisma.siteMaterial.findMany();
    console.log(`Found ${materials.length} material rates.`);

    const priceMap = {};
    materials.forEach(m => {
        const key = `${m.name.trim().toLowerCase()}|${m.locationFrom.trim().toLowerCase()}|${m.locationTo.trim().toLowerCase()}`;
        priceMap[key] = { price: m.price, unit: m.unit };
    });

    let totalRevenue = 0;
    let matchCount = 0;
    
    trips.forEach(trip => {
        if (!trip.materialType) return;
        const key = `${trip.materialType.trim().toLowerCase()}|${trip.fromLocation.trim().toLowerCase()}|${trip.toLocation.trim().toLowerCase()}`;
        const rate = priceMap[key];

        if (rate) {
            matchCount++;
            let tripPrice = 0;
            if (rate.unit === "Per Trip") {
                tripPrice = rate.price;
            } else if (rate.unit === "Per Ton") {
                const capacity = parseFloat(trip.vehicle.capacity || "0");
                tripPrice = rate.price * capacity;
            } else {
                 tripPrice = rate.price;
            }
            totalRevenue += tripPrice;
        } else {
            // console.log(`Unmatched Trip: ${key}`);
        }
    });

    console.log(`Matched ${matchCount}/${trips.length} trips.`);
    console.log(`Total Estimated Revenue: ${totalRevenue}`);
    await prisma.$disconnect();
}

testRevenue().catch(console.error);
