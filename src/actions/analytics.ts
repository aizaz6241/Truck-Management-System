"use server";
// Re-trigger TS check

import { prisma } from "@/lib/db";

export type FilterType =
  | "today"
  | "7d"
  | "30d"
  | "6m"
  | "1y"
  | "3y"
  | "all"
  | "date"
  | "month"
  | "year";

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
        lte: endDate,
      },
    },
    include: { vehicle: true },
  });

  const rvt = trips.filter((t) => t.vehicle.ownership === "RVT").length;
  const taxi = trips.filter((t) => t.vehicle.ownership === "Taxi").length;

  return { rvt, taxi, total: trips.length };
}

export async function getRvtTrips(filterType: FilterType, dateParam?: string) {
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
        lte: endDate,
      },
      vehicle: {
        ownership: "RVT",
      },
    },
    include: {
      vehicle: true,
      driver: {
        select: { name: true },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return trips;
}

export async function getRevenueStats(
  filterType: FilterType,
  dateParam?: string,
) {
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
  } else if (filterType === "3y") {
    startDate.setFullYear(startDate.getFullYear() - 3);
  } else if (filterType === "all") {
    startDate = new Date(0); // Epoch
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

  // 1. Fetch all trips in range
  const trips = await prisma.trip.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { vehicle: true },
  });

  // 2. Fetch all materials (Potential Rates)
  const materials = await prisma.siteMaterial.findMany();

  // 3. Create Price Map: "Material|From|To" -> { price, unit }
  const priceMap: { [key: string]: { price: number; unit: string } } = {};
  materials.forEach((m) => {
    const key = `${m.name.trim().toLowerCase()}|${m.locationFrom.trim().toLowerCase()}|${m.locationTo.trim().toLowerCase()}`;
    // If duplicates exist, this will overwrite, but we assumed no conflict or identical prices
    priceMap[key] = { price: m.price, unit: m.unit };
  });

  // 4. Calculate Revenue & Build Trend Data
  let totalRevenue = 0;
  const trendMap: { [date: string]: number } = {};

  trips.forEach((trip) => {
    if (!trip.materialType) return;

    const key = `${trip.materialType.trim().toLowerCase()}|${trip.fromLocation.trim().toLowerCase()}|${trip.toLocation.trim().toLowerCase()}`;
    const rate = priceMap[key];

    if (rate) {
      let tripPrice = 0;
      if (rate.unit === "Per Trip") {
        tripPrice = rate.price;
      } else if (rate.unit === "Per Ton") {
        const capacity = parseFloat(trip.vehicle.capacity || "0");
        tripPrice = rate.price * capacity;
      } else {
        // Default fallthrough known as Per Trip
        tripPrice = rate.price;
      }
      totalRevenue += tripPrice;

      // Group by Date for Chart
      const tripDate = new Date(trip.date).toISOString().split("T")[0];
      if (!trendMap[tripDate]) {
        trendMap[tripDate] = 0;
      }
      trendMap[tripDate] += tripPrice;
    }
  });

  // 5. Format Trend Data (Sort by date)
  const trend = Object.entries(trendMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { totalRevenue, trend };
}

export async function getInvoiceStats(
  filterType: FilterType,
  dateParam?: string,
) {
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

  const invoices = await prisma.invoice.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      totalAmount: true,
      paidAmount: true,
    },
  });

  let totalInvoiced = 0;
  let totalReceived = 0;
  const trendMap: { [date: string]: { total: number; received: number } } = {};

  invoices.forEach((inv) => {
    totalInvoiced += inv.totalAmount;
    totalReceived += inv.paidAmount;

    const dateKey = new Date(inv.date).toISOString().split("T")[0];
    if (!trendMap[dateKey]) {
      trendMap[dateKey] = { total: 0, received: 0 };
    }
    trendMap[dateKey].total += inv.totalAmount;
    trendMap[dateKey].received += inv.paidAmount;
  });

  const totalRemaining = totalInvoiced - totalReceived;

  const trend = Object.entries(trendMap)
    .map(([date, stats]) => ({
      date,
      total: stats.total,
      received: stats.received,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalInvoiced,
    totalReceived,
    totalRemaining,
    trend,
  };
}

export async function getContractorStats(
  filterType: FilterType,
  dateParam?: string,
) {
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
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      contractor: true,
    },
  });

  const contractorMap: {
    [key: string]: {
      name: string;
      total: number;
      received: number;
      remaining: number;
    };
  } = {};

  invoices.forEach((inv) => {
    const contractorName = inv.contractor.name;
    if (!contractorMap[contractorName]) {
      contractorMap[contractorName] = {
        name: contractorName,
        total: 0,
        received: 0,
        remaining: 0,
      };
    }
    contractorMap[contractorName].total += inv.totalAmount;
    contractorMap[contractorName].received += inv.paidAmount;
    contractorMap[contractorName].remaining += inv.totalAmount - inv.paidAmount;
  });

  return Object.values(contractorMap);
}

export async function getContractorTimeline(
  contractorId: number,
  filterType: FilterType,
  dateParam?: string,
) {
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
  } else if (filterType === "3y") {
    startDate.setFullYear(startDate.getFullYear() - 3);
  } else if (filterType === "all") {
    startDate = new Date(0); // Epoch
  } else if (filterType === "date" && dateParam) {
    startDate = new Date(dateParam);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(dateParam);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "month" && dateParam) {
    const [year, month] = dateParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  // 1. Fetch Invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      contractorId: contractorId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      totalAmount: true,
    },
    orderBy: { date: "asc" },
  });

  // 2. Fetch Payments
  const payments = await prisma.payment.findMany({
    where: {
      invoice: {
        contractorId: contractorId,
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      amount: true,
    },
    orderBy: { date: "asc" },
  });

  // 3. Merge Data into Timeline
  const timelineMap: {
    [date: string]: { date: string; invoiced: number; received: number };
  } = {};

  const addToMap = (
    date: Date,
    type: "invoiced" | "received",
    amount: number,
  ) => {
    const key = date.toISOString().split("T")[0];
    if (!timelineMap[key]) {
      timelineMap[key] = { date: key, invoiced: 0, received: 0 };
    }
    timelineMap[key][type] += amount;
  };

  invoices.forEach((inv) => addToMap(inv.date, "invoiced", inv.totalAmount));
  payments.forEach((pay) => addToMap(pay.date, "received", pay.amount));

  return Object.values(timelineMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export async function getAllContractors() {
  const contractors = await prisma.contractor.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return contractors;
}

export async function getDieselAnalytics(
  filterType: FilterType,
  dateParam?: string,
) {
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
    const [year, month] = dateParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  const records = await prisma.diesel.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: { date: "asc" },
  });

  let totalLiters = 0;
  let totalCost = 0;
  const trendMap: { [date: string]: { liters: number; cost: number } } = {};
  const vehicleMap: { [vehicle: string]: { liters: number; cost: number } } =
    {};

  records.forEach((record) => {
    totalLiters += record.liters;
    totalCost += record.totalAmount;

    // Trend Data
    const dateKey = new Date(record.date).toISOString().split("T")[0];
    if (!trendMap[dateKey]) {
      trendMap[dateKey] = { liters: 0, cost: 0 };
    }
    trendMap[dateKey].liters += record.liters;
    trendMap[dateKey].cost += record.totalAmount;

    // Vehicle Data
    const vehicleNum = record.vehicle.number;
    if (!vehicleMap[vehicleNum]) {
      vehicleMap[vehicleNum] = { liters: 0, cost: 0 };
    }
    vehicleMap[vehicleNum].liters += record.liters;
    vehicleMap[vehicleNum].cost += record.totalAmount;
  });

  const trend = Object.entries(trendMap)
    .map(([date, stats]) => ({
      date,
      liters: stats.liters,
      cost: stats.cost,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const vehicleStats = Object.entries(vehicleMap)
    .map(([vehicle, stats]) => ({
      vehicle,
      liters: stats.liters,
      cost: stats.cost,
    }))
    .sort((a, b) => b.liters - a.liters); // Sort by consumption desc

  return {
    totalLiters,
    totalCost,
    trend,
    vehicleStats,
  };
}
// ... existing code ...

export async function getTaxiAnalytics(
  filterType: FilterType,
  dateParam?: string,
  ownerId?: number,
) {
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
    const [year, month] = dateParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  // 1. Fetch Taxi Owners
  const owners = await prisma.taxiOwner.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // 2. Fetch Taxi Trips (for Trips Count & Revenue)
  // We need logic to calculate revenue for trips.
  // Reusing logic from getRevenueStats is ideal, but for now we'll duplicate the simple part
  // or better, just count trips for now and maybe simple revenue if stored?
  // revenue is calculated based on material rates.

  const trips = await prisma.trip.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      vehicle: { ownership: "Taxi" },
    },
    include: { vehicle: true },
  });

  // Calculate Trip Revenue (Basic implementation using Materials)
  const materials = await prisma.siteMaterial.findMany();
  const priceMap: { [key: string]: { price: number; unit: string } } = {};
  materials.forEach((m) => {
    const key = `${m.name.trim().toLowerCase()}|${m.locationFrom.trim().toLowerCase()}|${m.locationTo.trim().toLowerCase()}`;
    priceMap[key] = { price: m.price, unit: m.unit };
  });

  let totalTrips = 0;
  let ownerTrips = 0;
  let totalRevenue = 0;
  let ownerRevenue = 0;

  trips.forEach((trip) => {
    totalTrips++;
    const isOwner = ownerId && trip.vehicle.taxiOwnerId === ownerId;
    if (isOwner) ownerTrips++;

    // Revenue Calc
    if (trip.materialType) {
      const key = `${trip.materialType.trim().toLowerCase()}|${trip.fromLocation.trim().toLowerCase()}|${trip.toLocation.trim().toLowerCase()}`;
      const rate = priceMap[key];
      if (rate) {
        let price = 0;
        if (rate.unit === "Per Trip") price = rate.price;
        else if (rate.unit === "Per Ton")
          price = rate.price * parseFloat(trip.vehicle.capacity || "0");
        else price = rate.price;

        totalRevenue += price;
        if (isOwner) ownerRevenue += price;
      }
    }
  });

  // 3. Fetch Diesel
  const dieselRecords = await prisma.diesel.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      vehicle: { ownership: "Taxi" },
    },
    include: { vehicle: true },
  });

  let totalDieselCost = 0;
  let ownerDieselCost = 0;

  dieselRecords.forEach((record) => {
    totalDieselCost += record.totalAmount;
    if (ownerId && record.vehicle.taxiOwnerId === ownerId) {
      ownerDieselCost += record.totalAmount;
    }
  });

  return {
    owners,
    trips: { total: totalTrips, owner: ownerTrips },
    revenue: { total: totalRevenue, owner: ownerRevenue },
    diesel: { total: totalDieselCost, owner: ownerDieselCost },
  };
}

export async function getOwnerTripsAnalytics(
  ownerId: number,
  filterType: FilterType,
  dateParam?: string,
) {
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
    const [year, month] = dateParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  const trips = await prisma.trip.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      vehicle: { taxiOwnerId: ownerId },
    },
    include: { vehicle: true },
    orderBy: { date: "asc" },
  });

  // Structure for Recharts: Array of objects { date: 'YYYY-MM-DD', vehicleNum1: count, vehicleNum2: count ... }
  const chartDataMap: { [date: string]: any } = {};
  const vehiclesSet = new Set<string>();

  trips.forEach((trip) => {
    const dateKey = new Date(trip.date).toISOString().split("T")[0];
    const vehicleNum = trip.vehicle.number;
    vehiclesSet.add(vehicleNum);

    if (!chartDataMap[dateKey]) {
      chartDataMap[dateKey] = { date: dateKey };
    }

    if (!chartDataMap[dateKey][vehicleNum]) {
      chartDataMap[dateKey][vehicleNum] = 0;
    }
    chartDataMap[dateKey][vehicleNum]++;
  });

  // Fill in zeros for missing vehicles on existing dates to avoid gaps (optional but good for stacked, linear needs it less but safer)
  // Actually for line chart, missing points might break continuity or just be skipped.
  // Let's ensure every date entry has undefined/0 for known vehicles?
  // Recharts handles missing keys as undefined. better to put 0.

  Object.values(chartDataMap).forEach((entry) => {
    vehiclesSet.forEach((v) => {
      if (entry[v] === undefined) entry[v] = 0;
    });
  });

  const chartData = Object.values(chartDataMap).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return {
    chartData,
    vehicles: Array.from(vehiclesSet),
  };
}

export async function getOwnerRevenueAnalytics(
  ownerId: number,
  filterType: FilterType,
  dateParam?: string,
) {
  let startDate = new Date();
  let endDate = new Date();

  // Reset endpoints
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (filterType === "today") {
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
    const [year, month] = dateParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  const trips = await prisma.trip.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      vehicle: { taxiOwnerId: ownerId },
    },
    include: { vehicle: true },
    orderBy: { date: "asc" },
  });

  const materials = await prisma.siteMaterial.findMany();
  const priceMap: { [key: string]: { price: number; unit: string } } = {};
  materials.forEach((m) => {
    const key = `${m.name.trim().toLowerCase()}|${m.locationFrom.trim().toLowerCase()}|${m.locationTo.trim().toLowerCase()}`;
    priceMap[key] = { price: m.price, unit: m.unit };
  });

  const chartDataMap: { [date: string]: any } = {};
  const vehiclesSet = new Set<string>();

  trips.forEach((trip) => {
    if (!trip.materialType) return;
    const key = `${trip.materialType.trim().toLowerCase()}|${trip.fromLocation.trim().toLowerCase()}|${trip.toLocation.trim().toLowerCase()}`;
    const rate = priceMap[key];

    if (rate) {
      let price = 0;
      if (rate.unit === "Per Trip") price = rate.price;
      else if (rate.unit === "Per Ton")
        price = rate.price * parseFloat(trip.vehicle.capacity || "0");
      else price = rate.price;

      const dateKey = new Date(trip.date).toISOString().split("T")[0];
      const vehicleNum = trip.vehicle.number;
      vehiclesSet.add(vehicleNum);

      if (!chartDataMap[dateKey]) {
        chartDataMap[dateKey] = { date: dateKey };
      }
      if (!chartDataMap[dateKey][vehicleNum]) {
        chartDataMap[dateKey][vehicleNum] = 0;
      }
      chartDataMap[dateKey][vehicleNum] += price;
    }
  });

  Object.values(chartDataMap).forEach((entry) => {
    vehiclesSet.forEach((v) => {
      if (entry[v] === undefined) entry[v] = 0;
    });
  });

  const chartData = Object.values(chartDataMap).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return { chartData, vehicles: Array.from(vehiclesSet) };
}

export async function getOwnerDieselAnalytics(
  ownerId: number,
  filterType: FilterType,
  dateParam?: string,
) {
  let startDate = new Date();
  let endDate = new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (filterType === "today") {
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
    const [year, month] = dateParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === "year" && dateParam) {
    const year = parseInt(dateParam);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  const records = await prisma.diesel.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      vehicle: { taxiOwnerId: ownerId },
    },
    include: { vehicle: true },
    orderBy: { date: "asc" },
  });

  const chartDataMap: { [date: string]: any } = {};
  const vehiclesSet = new Set<string>();

  records.forEach((record) => {
    const dateKey = new Date(record.date).toISOString().split("T")[0];
    const vehicleNum = record.vehicle.number;
    vehiclesSet.add(vehicleNum);

    if (!chartDataMap[dateKey]) {
      chartDataMap[dateKey] = { date: dateKey };
    }
    if (!chartDataMap[dateKey][vehicleNum]) {
      chartDataMap[dateKey][vehicleNum] = 0;
    }
    chartDataMap[dateKey][vehicleNum] += record.totalAmount; // Using Cost (Total Amount)
  });

  Object.values(chartDataMap).forEach((entry) => {
    vehiclesSet.forEach((v) => {
      if (entry[v] === undefined) entry[v] = 0;
    });
  });

  const chartData = Object.values(chartDataMap).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return { chartData, vehicles: Array.from(vehiclesSet) };
}
