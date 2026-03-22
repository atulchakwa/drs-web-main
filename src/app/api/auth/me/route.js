import { NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

export async function GET(request) {
    const token = getTokenFromCookies(request);
    
    if (!token) {
        return NextResponse.json({ success: false, authenticated: false });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return NextResponse.json({ success: false, authenticated: false });
    }
    
    return NextResponse.json({
        success: true,
        authenticated: true,
        user: { email: decoded.email }
    });
}
