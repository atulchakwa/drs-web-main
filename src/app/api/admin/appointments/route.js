import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authMiddleware } from "@/lib/auth";
import { sendAppointmentStatusEmail } from "@/lib/mailer";

const SHIFT_HOURS = {
    "Morning (9 AM - 1 PM)": { start: "09:00", end: "13:00" },
    "Evening (4 PM - 8 PM)": { start: "16:00", end: "20:00" }
};

const VALID_SHIFTS = ["Morning (9 AM - 1 PM)", "Evening (4 PM - 8 PM)"];
const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

function sanitizeMessage(message) {
    if (!message) return '';
    return message.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

function normalizePhone(phone) {
    return phone?.replace(/\s+/g, '').replace(/^\+91/, '') || '';
}

export async function GET(request) {
    const auth = authMiddleware(request);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");
        const status = searchParams.get("status");
        const phone = searchParams.get("phone");

        const query = {};
        if (date) query.date = date;
        if (status) query.status = status;
        if (phone) {
            const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (cleanPhone.length > 0) {
                query.phone = { $regex: `^${cleanPhone}`, $options: 'i' };
            }
        }

        const appointments = await Appointment.find(query).sort({ date: -1, shift: 1 });

        const stats = await Appointment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statsMap = {};
        stats.forEach(s => { statsMap[s._id] = s.count; });

        return NextResponse.json({
            success: true,
            data: appointments,
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

export async function POST(request) {
    const auth = authMiddleware(request);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        // Validation
        if (!body.name || !body.phone || !body.date || !body.shift) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Phone validation
        const normalizedPhone = normalizePhone(body.phone);
        if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
            return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 });
        }

        // Email validation (if provided)
        if (body.email && body.email.trim()) {
            const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
            }
        }

        // Date format validation
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
            return NextResponse.json({ success: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
        }

        // Shift validation
        if (!VALID_SHIFTS.includes(body.shift)) {
            return NextResponse.json({ success: false, error: "Invalid shift selection" }, { status: 400 });
        }

        // Status validation (if provided)
        if (body.status && !VALID_STATUSES.includes(body.status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const collisionQuery = {
            date: body.date,
            shift: body.shift,
            status: { $nin: ['cancelled', 'completed'] }
        };

        if (body.preferredTime) {
            collisionQuery.preferredTime = body.preferredTime;
        }

        const existingAppointment = await Appointment.findOne(collisionQuery);

        if (existingAppointment) {
            return NextResponse.json(
                { success: false, error: "This time slot/preferred time is already booked" },
                { status: 409 }
            );
        }

        const appointment = await Appointment.create({
            name: body.name.trim(),
            phone: normalizedPhone,
            email: body.email?.trim() || '',
            date: body.date,
            shift: body.shift,
            shiftStart: body.shiftStart || SHIFT_HOURS[body.shift]?.start || '09:00',
            shiftEnd: body.shiftEnd || SHIFT_HOURS[body.shift]?.end || '13:00',
            preferredTime: body.preferredTime || '',
            message: sanitizeMessage(body.message),
            status: body.status || 'pending',
            dayOfWeek: new Date(body.date + 'T00:00:00').getDay()
        });

        // If status is confirmed, send confirmation email to patient in background
        if (appointment.status === 'confirmed' && appointment.email && appointment.email.trim()) {
            (async () => {
                try {
                    const { sendAppointmentConfirmationEmail } = await import("@/lib/mailer");
                    await sendAppointmentConfirmationEmail({
                        name: appointment.name,
                        date: appointment.date,
                        shift: appointment.shift,
                        shiftStart: appointment.shiftStart,
                        shiftEnd: appointment.shiftEnd
                    }, appointment.email);
                    await Appointment.findByIdAndUpdate(appointment._id, { confirmationEmailSent: true });
                    console.log(`Confirmation email sent to ${appointment.email}`);
                } catch (emailErr) {
                    console.error("Failed to send patient confirmation email in background:", emailErr);
                }
            })();
        }

        return NextResponse.json({ success: true, data: appointment }, { status: 201 });

    } catch (err) {
        console.error("Failed to create appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request) {
    const auth = authMiddleware(request);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }
        const { id, status, notes, shiftStart, shiftEnd } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "Appointment ID is required" }, { status: 400 });
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        const previousStatus = appointment.status;

        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === 'confirmed') {
                updateData.confirmedAt = new Date();
                updateData.confirmedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            } else if (status === 'cancelled') {
                updateData.cancelledAt = new Date();
            }
        }
        if (notes !== undefined) updateData.notes = notes;
        if (shiftStart) updateData.shiftStart = shiftStart;
        if (shiftEnd) updateData.shiftEnd = shiftEnd;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (status && appointment.email && appointment.email.trim()) {
            (async () => {
                try {
                    await sendAppointmentStatusEmail({
                        name: updatedAppointment.name,
                        date: updatedAppointment.date,
                        shift: updatedAppointment.shift,
                        shiftStart: updatedAppointment.shiftStart,
                        shiftEnd: updatedAppointment.shiftEnd
                    }, appointment.email, status);

                    if (status === 'confirmed') {
                        await Appointment.findByIdAndUpdate(id, { confirmationEmailSent: true });
                    }
                    console.log(`Status update email (${status}) sent to ${appointment.email}`);
                } catch (emailErr) {
                    console.error(`Failed to send ${status} email in background:`, emailErr);
                }
            })();
        }

        return NextResponse.json({ success: true, data: updatedAppointment });

    } catch (err) {
        console.error("Failed to update appointment:", err);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
