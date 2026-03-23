import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { sendAppointmentNotificationEmail } from "@/lib/mailer";
import { authMiddleware } from "@/lib/auth";

const VALID_SHIFTS = {
    weekday: ["Morning (9 AM - 1 PM)", "Evening (4 PM - 8 PM)"],
    saturday: ["Morning (9 AM - 1 PM)"],
    sunday: []
};

const SHIFT_HOURS = {
    "Morning (9 AM - 1 PM)": { start: "09:00", end: "13:00" },
    "Evening (4 PM - 8 PM)": { start: "16:00", end: "20:00" }
};

// Simple in-memory rate limiter
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 5;

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = ipRequests.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
        return false;
    }

    recentRequests.push(now);
    ipRequests.set(ip, recentRequests);
    return true;
}

function validatePhone(phone) {
    const cleanPhone = phone?.replace(/\s+/g, '').replace(/^\+91/, '');
    return /^[6-9]\d{9}$/.test(cleanPhone);
}

function validateEmail(email) {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

function getDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    return date.getDay();
}

function isValidDateForClinic(dateStr, shift) {
    const date = new Date(dateStr);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    today.setHours(0, 0, 0, 0);

    if (date < today) {
        return { valid: false, error: "Cannot select past dates" };
    }

    // 60-day limit
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (date > maxDate) {
        return { valid: false, error: "Appointments can only be booked up to 60 days in advance" };
    }

    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
        return { valid: false, error: "Clinic is closed on Sundays" };
    }

    // Same-day booking check
    if (dateStr === todayStr && shift) {
        const hours = SHIFT_HOURS[shift];
        if (hours) {
            const now = new Date();
            const [startH, startM] = hours.start.split(':').map(Number);
            const startTime = new Date();
            startTime.setHours(startH, startM, 0, 0);

            // If current time is after shift start, don't allow same-day booking for that shift
            if (now > startTime) {
                return { valid: false, error: `Same-day booking for ${shift} is closed. Please select another date or shift.` };
            }
        }
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
    if (data.name && data.name.length > 100) {
        errors.push("Name must be less than 100 characters");
    }
    if (!validatePhone(data.phone)) {
        errors.push("Invalid phone number");
    }
    if (data.email && !validateEmail(data.email)) {
        errors.push("Invalid email address");
    }
    if (!data.date) {
        errors.push("Date is required");
    } else {
        const dateValidation = isValidDateForClinic(data.date, data.shift);
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
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { success: false, error: "Too many requests. Please try again after an hour." },
            { status: 429 }
        );
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json(
                { success: false, error: "Invalid JSON or empty body" },
                { status: 400 }
            );
        }

        const validationErrors = validateAppointment(body);
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: validationErrors[0], details: validationErrors },
                { status: 400 }
            );
        }

        await connectDB();

        // Check for existing appointment with same phone on same date
        const existingByPhone = await Appointment.findOne({
            phone: body.phone,
            date: body.date,
            status: { $nin: ['cancelled', 'completed', 'no-show'] }
        });

        if (existingByPhone) {
            return NextResponse.json(
                { success: false, error: "You already have an active appointment for this date. Please select a different date or call us directly." },
                { status: 409 }
            );
        }

        // Check if the time slot/preferred time is already booked
        const collisionQuery = {
            date: body.date,
            shift: body.shift,
            status: { $nin: ['cancelled', 'completed', 'no-show'] }
        };

        if (body.preferredTime) {
            collisionQuery.preferredTime = body.preferredTime;
        }

        const existingBySlot = await Appointment.findOne(collisionQuery);

        if (existingBySlot) {
            const errorMsg = body.preferredTime
                ? `The time slot ${body.preferredTime} is already booked. Please select a different time.`
                : "This time slot is fully booked. Please select a different time slot.";
            return NextResponse.json(
                { success: false, error: errorMsg },
                { status: 409 }
            );
        }

        const appointment = await Appointment.create({
            name: body.name.trim(),
            phone: body.phone.trim(),
            email: body.email?.trim() || '',
            date: body.date,
            shift: body.shift,
            shiftStart: SHIFT_HOURS[body.shift]?.start || '09:00',
            shiftEnd: SHIFT_HOURS[body.shift]?.end || '13:00',
            preferredTime: body.preferredTime || '',
            message: body.message?.trim() || '',
            status: 'pending',
            dayOfWeek: getDayOfWeek(body.date),
            ipAddress: ip,
            createdAt: new Date()
        });

        const displayTime = body.preferredTime
            ? `${body.preferredTime} (within ${appointment.shift})`
            : appointment.shift;

        // Send notification email to clinic
        try {
            await sendAppointmentNotificationEmail({
                name: appointment.name,
                phone: appointment.phone,
                email: appointment.email,
                date: appointment.date,
                shift: appointment.shift,
                preferredTime: appointment.preferredTime,
                message: appointment.message,
                appointmentId: appointment._id.toString(),
                displayTime: displayTime
            });
            console.log(`Notification email sent to clinic for ${appointment._id}`);
        } catch (emailErr) {
            console.error("Failed to send clinic notification:", emailErr);
        }

        // Send acknowledgment email to patient
        if (appointment.email) {
            try {
                const { sendAppointmentAcknowledgementEmail } = await import("@/lib/mailer");
                await sendAppointmentAcknowledgementEmail({
                    name: appointment.name,
                    date: appointment.date,
                    shift: appointment.shift,
                    preferredTime: appointment.preferredTime
                }, appointment.email);
                console.log(`Acknowledgment email sent to patient: ${appointment.email}`);
            } catch (ackErr) {
                console.error("Failed to send patient acknowledgment email:", ackErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id: appointment._id,
                name: appointment.name,
                date: appointment.date,
                shift: appointment.shift,
                preferredTime: appointment.preferredTime,
                shiftTime: `${appointment.shiftStart} - ${appointment.shiftEnd}`,
                status: appointment.status
            },
            message: "Appointment request submitted successfully! Your Appointment ID is: " + appointment._id
        }, { status: 201 });

    } catch (err) {
        console.error("Appointment creation failed:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    const auth = authMiddleware(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

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
