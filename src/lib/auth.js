import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authMiddleware(request) {
    const token = request.headers.get("authorization")?.split(" ")[1];
    
    if (!token) {
        return { authorized: false, error: "No token provided" };
    }
    
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "admin-secret-key-change-in-production"
        );
        return { authorized: true, admin: decoded };
    } catch (err) {
        return { authorized: false, error: "Invalid token" };
    }
}
