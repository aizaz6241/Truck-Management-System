import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
    await logout(); // Clears cookie
    return NextResponse.json({ message: "Logged out" });
}
