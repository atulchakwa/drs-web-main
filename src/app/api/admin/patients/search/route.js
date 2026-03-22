import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authMiddleware } from "@/lib/auth";

export async function GET(request) {
    const auth = authMiddleware(request);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        
        if (!phone) {
            return NextResponse.json({ success: false, error: "Phone required" }, { status: 400 });
        }
        
        const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const patients = await Appointment.aggregate([
            { $match: { phone: { $regex: `^${cleanPhone}`, $options: 'i' } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$phone",
                    name: { $first: "$name" },
                    phone: { $first: "$phone" },
                    totalVisits: { $sum: 1 },
                    lastVisit: { $first: "$date" },
                    appointments: { $push: { id: "$_id", date: "$date", shift: "$shift", status: "$status" } }
                }
            },
            { $limit: 10 }
        ]);
        
        return NextResponse.json({ success: true, data: patients });
        
    } catch (err) {
        console.error("Search failed:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
