import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name must be less than 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    date: {
        type: String,
        required: [true, 'Date is required']
    },
    shift: {
        type: String,
        required: [true, 'Shift is required'],
        enum: ['Morning (9 AM - 1 PM)', 'Evening (4 PM - 8 PM)']
    },
    shiftStart: {
        type: String,
        default: '09:00'
    },
    shiftEnd: {
        type: String,
        default: '13:00'
    },
    preferredTime: {
        type: String,
        trim: true,
        default: ''
    },
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, 'Message must be less than 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    confirmedAt: Date,
    confirmedTime: {
        type: String,
        trim: true
    },
    cancelledAt: Date,
    cancelledBy: {
        type: String,
        enum: ['doctor', 'patient', 'system']
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    confirmationEmailSent: {
        type: Boolean,
        default: false
    },
    cancellationEmailSent: {
        type: Boolean,
        default: false
    },
    auditLog: [{
        status: String,
        previousStatus: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
        notes: String
    }],
    ipAddress: String
}, {
    timestamps: true
});

AppointmentSchema.index({ date: 1, shift: 1, status: 1 });
AppointmentSchema.index({ phone: 1 });
AppointmentSchema.index({ email: 1 });
AppointmentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Appointment ||
    mongoose.model("Appointment", AppointmentSchema);
