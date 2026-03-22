import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authMiddleware } from "@/lib/auth";
import { sendAppointmentStatusEmail } from "@/lib/mailer";

const SHIFT_HOURS = {
    "Morning (9 AM - 1 PM)": { start: "09:00", end: "13:00" },
    "Evening (4 PM - 8 PM)": { start: "16:00", end: "20:00" }
};

export async function PUT(request, { params }) {
    const auth = authMiddleware(request);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    try {
        const resolvedParams = await params;
        await connectDB();
        const body = await request.json();

        const currentAppointment = await Appointment.findById(resolvedParams.id);
        if (!currentAppointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        if (body.date && body.shift) {
            const existing = await Appointment.findOne({
                _id: { $ne: resolvedParams.id },
                date: body.date,
                shift: body.shift,
                status: { $ne: 'cancelled' }
            });

            if (existing) {
                return NextResponse.json(
                    { success: false, error: "Time slot already booked" },
                    { status: 409 }
                );
            }
        }

        const updateData = {};
        if (body.name) updateData.name = body.name.trim();
        if (body.phone) updateData.phone = body.phone.trim();
        if (body.date) updateData.date = body.date;
        if (body.shift) {
            updateData.shift = body.shift;
            updateData.shiftStart = SHIFT_HOURS[body.shift]?.start || '09:00';
            updateData.shiftEnd = SHIFT_HOURS[body.shift]?.end || '13:00';
        }
        if (body.status) updateData.status = body.status;
        if (body.message !== undefined) updateData.message = body.message?.trim() || '';

        const previousStatus = currentAppointment.status;

        if (body.status === 'confirmed') {
            updateData.confirmedAt = new Date();
            if (body.confirmedTime) updateData.confirmedTime = body.confirmedTime;
        }
        if (body.status === 'cancelled') updateData.cancelledAt = new Date();

        const appointment = await Appointment.findByIdAndUpdate(resolvedParams.id, updateData, { new: true });

        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        if (body.status && currentAppointment.email) {
            try {
                await sendAppointmentStatusEmail({
                    name: appointment.name,
                    date: appointment.date,
                    shift: appointment.shift,
                    shiftStart: appointment.shiftStart,
                    shiftEnd: appointment.shiftEnd
                }, currentAppointment.email, body.status);

                if (body.status === 'confirmed') {
                    await Appointment.findByIdAndUpdate(resolvedParams.id, { confirmationEmailSent: true });
                }
                console.log(`Email sent (${body.status}) to ${currentAppointment.email}`);
            } catch (emailErr) {
                console.error(`Failed to send ${body.status} email:`, emailErr);
            }
        }

        return NextResponse.json({ success: true, data: appointment });

    } catch (err) {
        console.error("Failed to update appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const auth = authMiddleware(request);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    try {
        const resolvedParams = await params;
        await connectDB();
        const appointment = await Appointment.findByIdAndDelete(resolvedParams.id);

        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Deleted successfully" });

    } catch (err) {
        console.error("Failed to delete appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
