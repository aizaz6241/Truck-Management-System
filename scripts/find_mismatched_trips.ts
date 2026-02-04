
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findMismatchedTrips() {
  console.log("Searching for mismatched trips...");

  // 1. Get all SiteMaterials
  const siteMaterials = await prisma.siteMaterial.findMany({
    include: { site: { include: { contractor: true } } }
  });

  const materialMap: { [key: string]: string } = {};
  
  // Map of "Material|To" -> "From" (Assuming From is what changed)
  const routeCandidates: { [key: string]: { expectedFrom: string, contractor: string }[] } = {};

  siteMaterials.forEach((sm) => {
    if (sm.site && sm.site.contractor) {
      const mat = sm.name.trim().toLowerCase();
      const from = sm.locationFrom.trim().toLowerCase();
      const to = sm.locationTo.trim().toLowerCase();

      // Exact match key
      materialMap[`${mat}|${from}|${to}`] = sm.site.contractor.name;

      // Candidate key: Material + To
      const candidateKey = `${mat}|${to}`;
      if (!routeCandidates[candidateKey]) {
        routeCandidates[candidateKey] = [];
      }
      routeCandidates[candidateKey].push({ 
          expectedFrom: sm.locationFrom, // Keep original case for display
          contractor: sm.site.contractor.name 
      });
    }
  });

  // 2. Scan Trips
  const trips = await prisma.trip.findMany();
  
  let mismatchCount = 0;

  trips.forEach(trip => {
      if (!trip.materialType) return;
      
      const mat = trip.materialType.trim().toLowerCase();
      const from = trip.fromLocation.trim().toLowerCase();
      const to = trip.toLocation.trim().toLowerCase();
      const fullKey = `${mat}|${from}|${to}`;

      // If exact match found, it's good
      if (materialMap[fullKey]) return;

      // If NO exact match, check candidates
      const candidateKey = `${mat}|${to}`;
      const candidates = routeCandidates[candidateKey];

      if (candidates && candidates.length > 0) {
          mismatchCount++;
          console.log(`\n[MISMATCH] Trip ID: ${trip.id} | Date: ${trip.date.toISOString().split('T')[0]}`);
          console.log(`  Current:  Materian="${trip.materialType}", From="${trip.fromLocation}", To="${trip.toLocation}"`);
          
          candidates.forEach(c => {
              console.log(`  Target?:  From="${c.expectedFrom}" (Contractor: ${c.contractor})`);
          });
      }
  });

  console.log(`\nFound ${mismatchCount} mismatched trips.`);
}

findMismatchedTrips()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
