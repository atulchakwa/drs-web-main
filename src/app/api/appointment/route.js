import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { sendAppointmentNotificationEmail, sendAppointmentConfirmationEmail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

const VALID_SHIFTS = {
    weekday: ["Morning (9 AM - 1 PM)", "Evening (4 PM - 8 PM)"],
    saturday: ["Morning (9 AM - 1 PM)"],
    sunday: []
};

const SHIFT_HOURS = {
    "Morning (9 AM - 1 PM)": { start: "09:00", end: "13:00" },
    "Evening (4 PM - 8 PM)": { start: "16:00", end: "20:00" }
};

function validatePhone(phone) {
    const cleanPhone = phone?.replace(/\s+/g, '').replace(/^\+91/, '');
    return /^[6-9]\d{9}$/.test(cleanPhone);
}

function getDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    return date.getDay();
}

function isValidDateForClinic(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
        return { valid: false, error: "Cannot select past dates" };
    }
    
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) {
        return { valid: false, error: "Clinic is closed on Sundays" };
    }
    
    return { valid: true, dayOfWeek };
}

function isValidShiftForDay(shift, dayOfWeek) {
    if (dayOfWeek === 0) {
        return { valid: false, error: "Clinic is closed on Sundays" };
    }
    
    if (dayOfWeek === 6) {
        if (shift !== "Morning (9 AM - 1 PM)") {
            return { valid: false, error: "Saturday clinic closes at 2 PM. Only morning appointments available." };
        }
        return { valid: true };
    }
    
    if (!VALID_SHIFTS.weekday.includes(shift)) {
        return { valid: false, error: "Invalid shift for this day" };
    }
    
    return { valid: true };
}

function validateAppointment(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
    }
    if (!data.name || data.name.length > 100) {
        errors.push("Name must be less than 100 characters");
    }
    if (!validatePhone(data.phone)) {
        errors.push("Invalid phone number");
    }
    if (!data.date) {
        errors.push("Date is required");
    } else {
        const dateValidation = isValidDateForClinic(data.date);
        if (!dateValidation.valid) {
            errors.push(dateValidation.error);
        } else {
            const shiftValidation = isValidShiftForDay(data.shift, dateValidation.dayOfWeek);
            if (!shiftValidation.valid) {
                errors.push(shiftValidation.error);
            }
        }
    }
    if (!data.shift) {
        errors.push("Please select a time slot");
    } else if (!VALID_SHIFTS.weekday.includes(data.shift) && !VALID_SHIFTS.saturday.includes(data.shift)) {
        errors.push("Invalid shift selection");
    }
    if (data.message && data.message.length > 500) {
        errors.push("Message must be less than 500 characters");
    }

    return errors;
}

export async function POST(req) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        
        const { success, limit, remaining, reset } = await rateLimit(ip);
        
        if (!success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later.", retryAfter: reset },
                { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining, 'X-RateLimit-Reset': reset } }
            );
        }

        const body = await req.json();
        
        const validationErrors = validateAppointment(body);
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: "Validation failed", details: validationErrors },
                { status: 400 }
            );
        }

        await connectDB();
        
        const existingByPhone = await Appointment.findOne({
            phone: body.phone,
            date: body.date,
            status: { $ne: 'cancelled' }
        });
        
        if (existingByPhone) {
            return NextResponse.json(
                { success: false, error: "You already have an appointment for this date. Please select a different date or call us directly." },
                { status: 409 }
            );
        }
        
        const existingBySlot = await Appointment.findOne({
            date: body.date,
            shift: body.shift,
            status: { $in: ['pending', 'confirmed'] }
        });
        
        if (existingBySlot) {
            return NextResponse.json(
                { success: false, error: "This time slot is fully booked. Please select a different time slot." },
                { status: 409 }
            );
        }

        const appointment = await Appointment.create({
            name: body.name.trim(),
            phone: body.phone.trim(),
            date: body.date,
            shift: body.shift,
            shiftStart: SHIFT_HOURS[body.shift]?.start || '09:00',
            shiftEnd: SHIFT_HOURS[body.shift]?.end || '13:00',
            message: body.message?.trim() || '',
            status: 'pending',
            dayOfWeek: getDayOfWeek(body.date),
            createdAt: new Date()
        });

        try {
            await sendAppointmentNotificationEmail({
                ...body,
                appointmentId: appointment._id.toString()
            });
        } catch (emailErr) {
            console.error("Failed to send clinic notification:", emailErr);
        }
        
        if (body.email) {
            try {
                await sendAppointmentConfirmationEmail({
                    name: appointment.name,
                    date: appointment.date,
                    shift: appointment.shift
                }, body.email);
            } catch (emailErr) {
                console.error("Failed to send patient confirmation:", emailErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id: appointment._id,
                name: appointment.name,
                date: appointment.date,
                shift: appointment.shift,
                shiftTime: `${appointment.shiftStart} - ${appointment.shiftEnd}`,
                status: appointment.status
            }
        }, { status: 201 });

    } catch (err) {
        console.error("Appointment creation failed:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const status = searchParams.get('status');
        
        const query = {};
        if (date) query.date = date;
        if (status) query.status = status;
        
        const appointments = await Appointment.find(query).sort({ createdAt: -1 });
        
        return NextResponse.json({
            success: true,
            data: appointments
        });
    } catch (err) {
        console.error("Failed to fetch appointments:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
