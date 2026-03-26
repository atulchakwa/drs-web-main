import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { sendAppointmentNotificationEmail, sendAppointmentAcknowledgementEmail } from "@/lib/mailer";
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

// Simple in-memory rate limiter with cleanup
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 5;
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Periodic cleanup to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [ip, times] of ipRequests) {
        const recent = times.filter(t => now - t < RATE_LIMIT_WINDOW);
        if (recent.length === 0) {
            ipRequests.delete(ip);
        } else {
            ipRequests.set(ip, recent);
        }
    }
}, CLEANUP_INTERVAL);

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
    const date = new Date(dateStr + 'T00:00:00');
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

function sanitizeMessage(message) {
    if (!message) return '';
    return message.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

function validatePreferredTime(preferredTime, shift) {
    if (!preferredTime) return { valid: true };
    
    const shiftHours = SHIFT_HOURS[shift];
    if (!shiftHours) return { valid: true };
    
    const [prefH, prefM] = preferredTime.replace(/\s*(AM|PM)\s*/i, '').split(':').map(Number);
    const [startH, startM] = shiftHours.start.split(':').map(Number);
    const [endH, endM] = shiftHours.end.split(':').map(Number);
    
    let prefInMins = prefH * 60 + prefM;
    const startInMins = startH * 60 + startM;
    const endInMins = endH * 60 + endM;
    
    if (preferredTime.toUpperCase().includes('PM') && prefH !== 12) prefInMins += 720;
    if (preferredTime.toUpperCase().includes('AM') && prefH === 12) prefInMins -= 720;
    
    if (prefInMins < startInMins || prefInMins > endInMins) {
        return { valid: false, error: `Preferred time ${preferredTime} is outside shift hours (${shiftHours.start} - ${shiftHours.end})` };
    }
    
    return { valid: true };
}

function normalizePhone(phone) {
    return phone?.replace(/\s+/g, '').replace(/^\+91/, '') || '';
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
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
            errors.push("Invalid date format. Use YYYY-MM-DD");
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
    }
    if (!data.shift) {
        errors.push("Please select a time slot");
    } else if (!VALID_SHIFTS.weekday.includes(data.shift) && !VALID_SHIFTS.saturday.includes(data.shift)) {
        errors.push("Invalid shift selection");
    }
    
    if (data.preferredTime && data.shift) {
        const timeValidation = validatePreferredTime(data.preferredTime, data.shift);
        if (!timeValidation.valid) {
            errors.push(timeValidation.error);
        }
    }
    
    if (data.message && data.message.length > 500) {
        errors.push("Message must be less than 500 characters");
    }

    return errors;
}

export async function POST(req) {
    const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
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

        const normalizedPhone = normalizePhone(body.phone);

        // Check for existing appointments that would conflict (sequential to avoid race conditions)
        const existingByPhone = await Appointment.findOne({
            phone: normalizedPhone,
            date: body.date,
            status: { $nin: ['cancelled', 'completed', 'no-show'] }
        });

        if (existingByPhone) {
            return NextResponse.json(
                { success: false, error: "You already have an active appointment for this date. Please select a different date or call us directly." },
                { status: 409 }
            );
        }

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
            phone: normalizedPhone,
            email: body.email?.trim() || '',
            date: body.date,
            shift: body.shift,
            shiftStart: SHIFT_HOURS[body.shift]?.start || '09:00',
            shiftEnd: SHIFT_HOURS[body.shift]?.end || '13:00',
            preferredTime: body.preferredTime || '',
            message: sanitizeMessage(body.message),
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

        } catch (emailErr) {
            console.error("Failed to send clinic notification:", emailErr.message);
        }

        // Send acknowledgment email to patient
        if (appointment.email && appointment.email.trim()) {

            try {
                await sendAppointmentAcknowledgementEmail({
                    name: appointment.name,
                    date: appointment.date,
                    shift: appointment.shift,
                    preferredTime: appointment.preferredTime
                }, appointment.email);

            } catch (ackErr) {
                console.error("Failed to send patient acknowledgment email:", ackErr.message);
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
