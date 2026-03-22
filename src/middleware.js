import { NextResponse } from "next/server";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public routes (no auth required)
    const publicRoutes = ["/", "/login", "/api/auth/login", "/api/auth/me", "/api/appointment"];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

    // Protected routes (auth required)
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/api/admin") ||
        pathname === "/api/auth/logout";

    // Skip middleware for static files
    if (pathname.includes("_next") || pathname.includes("favicon.ico") || pathname.includes("images")) {
        return NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Check authentication for protected routes
    if (isProtectedRoute) {
        const token = getTokenFromCookies(request);
        const decoded = token ? verifyToken(token) : null;

        if (!decoded) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
