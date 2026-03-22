import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

const COOKIE_NAME = "admin_token";

export function generateToken(email) {
    return jwt.sign(
        { email, role: "admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function createTokenResponse(email, statusCode = 200) {
    const token = generateToken(email);

    const response = NextResponse.json(
        { success: true, user: { email } },
        { status: statusCode }
    );

    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });

    return response;
}

export function clearTokenResponse() {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
    });
    return response;
}

export function getTokenFromCookies(request) {
    return request.cookies.get(COOKIE_NAME)?.value;
}

export function authMiddleware(request) {
    const token = getTokenFromCookies(request);

    if (!token) {
        return { authorized: false, error: "Unauthorized", status: 401 };
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return { authorized: false, error: "Invalid session", status: 401 };
    }

    return { authorized: true, user: decoded };
}

export function requireAuth(handler) {
    return async (request, context) => {
        const auth = authMiddleware(request);

        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        return handler(request, context, auth.user);
    };
}
