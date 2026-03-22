import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authMiddleware } from "@/lib/auth";
import { sendAppointmentConfirmationEmail } from "@/lib/mailer";

const VALID_SHIFTS = {
    "Morning (9 AM - 1 PM)": { start: "09:00", end: "13:00" },
    "Evening (4 PM - 8 PM)": { start: "16:00", end: "20:00" }
};

export async function GET(req) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const status = searchParams.get("status");
        const phone = searchParams.get("phone");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 50;
        
        const query = {};
        if (date) query.date = date;
        if (status) query.status = status;
        if (phone) {
            const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
            query.phone = { $regex: cleanPhone, $options: 'i' };
        }
        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        const skip = (page - 1) * limit;
        
        const [appointments, total] = await Promise.all([
            Appointment.find(query).sort({ date: -1, shift: 1 }).skip(skip).limit(limit),
            Appointment.countDocuments(query)
        ]);
        
        const stats = await Appointment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        const statsMap = {};
        stats.forEach(s => { statsMap[s._id] = s.count; });
        
        return NextResponse.json({
            success: true,
            data: appointments,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            stats: {
                pending: statsMap.pending || 0,
                confirmed: statsMap.confirmed || 0,
                completed: statsMap.completed || 0,
                cancelled: statsMap.cancelled || 0,
                "no-show": statsMap["no-show"] || 0
            }
        });
        
    } catch (err) {
        console.error("Failed to fetch appointments:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    
    try {
        await connectDB();
        const body = await req.json();
        
        const existingAppointment = await Appointment.findOne({
            phone: body.phone,
            date: body.date,
            shift: body.shift,
            status: { $ne: 'cancelled' }
        });
        
        if (existingAppointment) {
            return NextResponse.json(
                { success: false, error: "This time slot is already booked. Please select a different slot." },
                { status: 409 }
            );
        }
        
        const appointment = await Appointment.create({
            name: body.name.trim(),
            phone: body.phone.trim(),
            date: body.date,
            shift: body.shift,
            shiftStart: VALID_SHIFTS[body.shift]?.start || '09:00',
            shiftEnd: VALID_SHIFTS[body.shift]?.end || '13:00',
            message: body.message?.trim() || '',
            status: body.status || 'pending',
            dayOfWeek: new Date(body.date).getDay(),
            notes: body.notes || ''
        });
        
        return NextResponse.json({
            success: true,
            data: appointment
        }, { status: 201 });
        
    } catch (err) {
        console.error("Failed to create appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
