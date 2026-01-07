import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    const path = request.nextUrl.pathname;

    // Paths that don't need auth
    if (path === "/" || path === "/login" || path.startsWith("/api/auth")) {
        // If user is already logged in and tries to go to login, redirect to dashboard
        if (session && path === "/login") {
            const payload = await decrypt(session);
            if (payload?.user?.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url));
            } else if (payload?.user?.role === "DRIVER") {
                return NextResponse.redirect(new URL("/driver", request.url));
            }
        }
        return NextResponse.next();
    }

    // Protected paths
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Parse session
    const payload = await decrypt(session);
    if (!payload?.user) {
        // Invalid session
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = payload.user.role;

    // Role based access
    if (path.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (path.startsWith("/driver") && role !== "DRIVER") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/driver/:path*",
        "/login"
    ],
};
