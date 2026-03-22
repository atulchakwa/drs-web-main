import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        await connectDB();
        
        const { username, password } = await req.json();
        
        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: "Username and password are required" },
                { status: 400 }
            );
        }
        
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }
        
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET || "admin-secret-key-change-in-production",
            { expiresIn: "7d" }
        );
        
        return NextResponse.json({
            success: true,
            data: {
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    name: admin.name,
                    role: admin.role
                }
            }
        });
        
    } catch (err) {
        console.error("Admin login failed:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        
        const { username, password, name } = await req.json();
        
        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: "Username and password are required" },
                { status: 400 }
            );
        }
        
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return NextResponse.json(
                { success: false, error: "Username already exists" },
                { status: 409 }
            );
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await Admin.create({
            username,
            password: hashedPassword,
            name: name || username,
            role: 'admin'
        });
        
        return NextResponse.json({
            success: true,
            data: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                role: admin.role
            }
        });
        
    } catch (err) {
        console.error("Admin creation failed:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
