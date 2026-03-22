import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'Admin'
    },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'admin'
    }
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
