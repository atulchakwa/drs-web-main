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

        // Time Validation if confirming
        if (body.status === 'confirmed' && body.confirmedTime) {
            const shift = body.shift || currentAppointment.shift;
            const hours = SHIFT_HOURS[shift];
            if (hours) {
                const [timeH, timeM] = body.confirmedTime.split(':').map(Number);
                const [startH, startM] = hours.start.split(':').map(Number);
                const [endH, endM] = hours.end.split(':').map(Number);

                const timeInMins = timeH * 60 + timeM;
                const startInMins = startH * 60 + startM;
                const endInMins = endH * 60 + endM;

                if (timeInMins < startInMins || timeInMins > endInMins) {
                    return NextResponse.json(
                        { success: false, error: `Confirmation time ${body.confirmedTime} is outside shift hours (${hours.start} - ${hours.end})` },
                        { status: 400 }
                    );
                }
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
        if (body.status === 'cancelled') {
            updateData.cancelledAt = new Date();
            updateData.cancelledBy = body.cancelledBy || 'doctor';
            updateData.cancellationReason = body.cancellationReason || '';
        }

        // Audit Log
        if (body.status && body.status !== previousStatus) {
            updateData.$push = {
                auditLog: {
                    status: body.status,
                    previousStatus: previousStatus,
                    changedAt: new Date(),
                    changedBy: auth.user?.email || 'admin',
                    notes: body.cancellationReason || body.notes || ''
                }
            };
        }

        const appointment = await Appointment.findByIdAndUpdate(
            resolvedParams.id,
            updateData.status && updateData.status !== previousStatus ? { $set: { ...updateData, $push: undefined }, $push: updateData.$push } : updateData,
            { new: true }
        );

        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        // Asynchronous Notification (Don't await to keep API fast)
        const sendNotification = async () => {
            try {
                if (body.status && currentAppointment.email) {
                    if (body.status === 'confirmed' && currentAppointment.confirmationEmailSent) {
                        return;
                    }
                    await sendAppointmentStatusEmail({
                        name: appointment.name,
                        date: appointment.date,
                        shift: appointment.shift,
                        shiftStart: appointment.shiftStart,
                        shiftEnd: appointment.shiftEnd
                    }, currentAppointment.email, body.status, appointment.cancellationReason);

                    const emailUpdate = {};
                    if (body.status === 'confirmed') emailUpdate.confirmationEmailSent = true;
                    if (body.status === 'cancelled') emailUpdate.cancellationEmailSent = true;

                    if (Object.keys(emailUpdate).length > 0) {
                        await Appointment.findByIdAndUpdate(resolvedParams.id, emailUpdate);
                    }
                } else if (body.status === 'cancelled' && !currentAppointment.email) {
                    const { sendWhatsAppMsg } = await import("@/lib/twilio");
                    const message = `Hello ${appointment.name}, your appointment scheduled for ${appointment.date} during ${appointment.shift} has been cancelled by the clinic. Reason: ${appointment.cancellationReason || 'Not specified'}. Please contact us for rescheduling.`;
                    await sendWhatsAppMsg(appointment.phone, message);
                }
            } catch (notifyErr) {
                console.error("Background notification failed:", notifyErr);
            }
        };

        // Asynchronous Notification (Don't await to keep API fast)
        sendNotification();

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
