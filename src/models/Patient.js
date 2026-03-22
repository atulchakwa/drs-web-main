import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
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
