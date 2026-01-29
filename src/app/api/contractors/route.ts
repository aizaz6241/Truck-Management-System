import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    try {
        const contractors = await prisma.contractor.findMany({
            where: {
                ...(status ? { status } : {})
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(contractors);
    } catch (e) {
        return NextResponse.json({ message: "Error fetching contractors" }, { status: 500 });
    }
}
