import { prisma } from "@/lib/db";

export async function getAnalyticsData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // 1. Today's Trips
    const todayTrips = await prisma.trip.findMany({
        where: {
            date: {
                gte: today,
                lt: endOfDay
            }
        },
        include: { driver: true, vehicle: true },
        orderBy: { date: "desc" }
    });

    // 2. Trend Data Helpers
    const getTrendData = async (days: number) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const trips = await prisma.trip.findMany({
            where: {
                date: { gte: startDate }
            }
        });

        // Group by Date
        const grouped: { [key: string]: number } = {};
        for (let d = 0; d <= days; d++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + d);
            const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
            grouped[key] = 0;
        }

        trips.forEach(t => {
            const key = new Date(t.date).toISOString().split('T')[0];
            if (grouped[key] !== undefined) {
                grouped[key]++;
            }
        });

        return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    };

    const getYearlyTrendData = async () => {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setDate(1); // Start from 1st of that month
        startDate.setHours(0, 0, 0, 0);

        const trips = await prisma.trip.findMany({
            where: {
                date: { gte: startDate }
            }
        });

        const grouped: { [key: string]: number } = {};
        // Initialize months
        for (let i = 0; i < 12; i++) {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i);
            const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            grouped[key] = 0;
        }

        trips.forEach(t => {
            const key = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (grouped[key] !== undefined) {
                grouped[key]++;
            }
        });

        return Object.entries(grouped).map(([name, count]) => ({ name, count }));
    };

    const trend7Days = await getTrendData(7);
    const trend30Days = await getTrendData(30);
    const trend1Year = await getYearlyTrendData();

    return {
        todayTrips,
        trend7Days,
        trend30Days,
        trend1Year
    };
}
