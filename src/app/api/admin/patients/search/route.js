import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authMiddleware } from "@/lib/auth";

export async function GET(req) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get("phone");
        
        if (!phone) {
            return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
        }
        
        const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
        
        const patients = await Appointment.aggregate([
            { $match: { phone: { $regex: cleanPhone, $options: 'i' } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$phone",
                    name: { $first: "$name" },
                    phone: { $first: "$phone" },
                    totalAppointments: { $sum: 1 },
                    lastVisit: { $first: "$date" },
                    appointments: { $push: { id: "$_id", date: "$date", shift: "$shift", status: "$status", createdAt: "$createdAt" } }
                }
            },
            { $limit: 10 }
        ]);
        
        return NextResponse.json({ success: true, data: patients });
        
    } catch (err) {
        console.error("Failed to search patients:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
