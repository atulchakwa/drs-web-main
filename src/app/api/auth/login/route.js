import { NextResponse } from "next/server";
import { createTokenResponse } from "@/lib/auth";

const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Periodic cleanup to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts) {
        if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
            loginAttempts.delete(ip);
        }
    }
}, CLEANUP_INTERVAL);

function checkRateLimit(ip) {
    const now = Date.now();
    const record = loginAttempts.get(ip);
    
    if (!record) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
        return true;
    }
    
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
        return true;
    }
    
    if (record.count >= MAX_ATTEMPTS) {
        return false;
    }
    
    record.count++;
    return true;
}

export async function POST(request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: "Too many login attempts. Please try again in 15 minutes." },
                { status: 429 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid JSON" },
                { status: 400 }
            );
        }

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            );
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error("Admin credentials are not set in the environment variables.");
            return NextResponse.json(
                { success: false, error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        return createTokenResponse(adminEmail);

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
