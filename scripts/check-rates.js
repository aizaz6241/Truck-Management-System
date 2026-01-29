const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  const materials = await prisma.siteMaterial.findMany({
    include: {
        site: {
            include: {
                contractor: true
            }
        }
    }
  });

  const map = {};

  materials.forEach(m => {
    // Normalize key
    const key = `${m.name.trim().toLowerCase()}|${m.locationFrom.trim().toLowerCase()}|${m.locationTo.trim().toLowerCase()}`;
    
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push({
        price: m.price,
        contractor: m.site?.contractor?.name || "Unknown",
        site: m.site?.name,
        unit: m.unit
    });
  });

  console.log("--- Duplicate Routes Analysis ---");
  let duplicatesFound = false;
  Object.entries(map).forEach(([key, matches]) => {
      if (matches.length > 1) {
          const distinctPrices = new Set(matches.map(x => x.price));
          if (distinctPrices.size > 1) {
              duplicatesFound = true;
              console.log(`\nCONFLICT: [${key}] has multiple prices!`);
              matches.forEach(m => console.log(`  - ${m.contractor} (${m.site}): ${m.price} ${m.unit}`));
          } else {
               // Same price, different contractor - safe to merge
               // console.log(`SAFE DUPLICATE: [${key}] (All ${matches[0].price})`);
          }
      }
  });

  if (!duplicatesFound) {
      console.log("No conflicting prices found for identical routes.");
  }
}

checkDuplicates()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
