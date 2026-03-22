import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authMiddleware } from "@/lib/auth";
import { sendAppointmentConfirmationEmail } from "@/lib/mailer";

export async function GET(req, { params }) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    
    try {
        await connectDB();
        const appointment = await Appointment.findById(params.id);
        
        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: appointment });
        
    } catch (err) {
        console.error("Failed to fetch appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    
    try {
        await connectDB();
        const body = await req.json();
        
        if (body.date && body.shift) {
            const existingAppointment = await Appointment.findOne({
                _id: { $ne: params.id },
                date: body.date,
                shift: body.shift,
                status: { $ne: 'cancelled' }
            });
            
            if (existingAppointment) {
                return NextResponse.json(
                    { success: false, error: "This time slot is already booked by another patient." },
                    { status: 409 }
                );
            }
        }
        
        const updateData = {};
        if (body.name) updateData.name = body.name.trim();
        if (body.phone) updateData.phone = body.phone.trim();
        if (body.date) updateData.date = body.date;
        if (body.shift) updateData.shift = body.shift;
        if (body.message !== undefined) updateData.message = body.message?.trim() || '';
        if (body.notes !== undefined) updateData.notes = body.notes?.trim() || '';
        if (body.status) updateData.status = body.status;
        
        if (body.shift && body.date) {
            const shiftHours = {
                "Morning (9 AM - 1 PM)": { start: "09:00", end: "13:00" },
                "Evening (4 PM - 8 PM)": { start: "16:00", end: "20:00" }
            };
            updateData.shiftStart = shiftHours[body.shift]?.start || '09:00';
            updateData.shiftEnd = shiftHours[body.shift]?.end || '13:00';
            updateData.dayOfWeek = new Date(body.date).getDay();
        }
        
        if (body.status === 'confirmed') {
            updateData.confirmedAt = new Date();
        } else if (body.status === 'cancelled') {
            updateData.cancelledAt = new Date();
        }
        
        const appointment = await Appointment.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true }
        );
        
        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }
        
        if (body.status === 'confirmed' && body.patientEmail) {
            try {
                await sendAppointmentConfirmationEmail(appointment, body.patientEmail);
                appointment.confirmationEmailSent = true;
                await appointment.save();
            } catch (emailErr) {
                console.error("Failed to send confirmation email:", emailErr);
            }
        }
        
        return NextResponse.json({ success: true, data: appointment });
        
    } catch (err) {
        console.error("Failed to update appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }
    
    try {
        await connectDB();
        const appointment = await Appointment.findByIdAndDelete(params.id);
        
        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "Appointment deleted" });
        
    } catch (err) {
        console.error("Failed to delete appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
