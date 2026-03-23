import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    totalVisits: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

PatientSchema.index({ phone: 1 });

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
