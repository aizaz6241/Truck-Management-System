import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { login } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user (allow finding by email or username logic if implemented, plan said email/username)
        // For now assuming email field holds username or email.
        // The schema has `email` as unique. To allow username, I'd need to check against name or alias?
        // Plan said "Login system (email/username + password)".
        // Schema User model has `email` @unique.
        // I'll check if input looks like email, if not maybe check against... wait, schema only has email.
        // I will assume for now login is by Email only as per schema.
        // Or I check `name` too? No, name is not unique.
        // I'll stick to Email for now.

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { message: "Account is inactive" },
                { status: 403 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create session
        // We only store essential info in session
        await login({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            redirect: user.role === 'ADMIN' ? '/admin' : '/driver'
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
