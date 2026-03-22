"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Clock, User, Phone, CheckCircle, XCircle,
    LogOut, Trash2, Edit, Activity, CheckCircle2, AlertCircle, LayoutDashboard, Globe
} from "lucide-react";

const STATUS_STYLES = {
    pending: {
        bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200",
        icon: <Clock className="w-4 h-4 mr-2" />,
        dot: "bg-amber-500"
    },
    confirmed: {
        bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200",
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        dot: "bg-emerald-500"
    },
    completed: {
        bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200",
        icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
        dot: "bg-blue-500"
    },
    cancelled: {
        bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200",
        icon: <XCircle className="w-4 h-4 mr-2" />,
        dot: "bg-rose-500"
    },
    "no-show": {
        bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
        dot: "bg-slate-500"
    }
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: "", date: "" });
    const [modal, setModal] = useState({ show: false, type: null, data: null });
    const [toast, setToast] = useState(null);
    const [confirmTime, setConfirmTime] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated) router.push("/login");
                else setUser(data.user);
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.set("status", filter.status);
            if (filter.date) params.set("date", filter.date);

            const res = await fetch(`/api/admin/appointments?${params}`);
            const data = await res.json();

            if (data.success) {
                setAppointments(data.data);
                setStats(data.stats);
            }
        } catch (err) {
            showToast("Failed to load appointments", "error");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (user) fetchAppointments();
    }, [user, fetchAppointments]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const handleModalOpen = (apt) => {
        setModal({ show: true, data: apt });
        setConfirmTime(apt.confirmedTime || "");
    };

    const updateStatus = async (id, status) => {
        try {
            const body = { status };
            if (status === 'confirmed' && confirmTime) {
                body.confirmedTime = confirmTime;
            }

            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Status updated to ${status}`);
                fetchAppointments();
                setModal({ show: false });
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Update failed", "error");
        }
    };

    const deleteAppointment = async (id) => {
        if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                showToast("Appointment deleted");
                fetchAppointments();
                setModal({ show: false });
            }
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const getStatusBadge = (status) => {
        const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot} mr-2`}></span>
                {status}
            </span>
        );
    };


    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`fixed top-6 right-6 px-5 py-3.5 rounded-2xl shadow-xl z-[100] flex items-center gap-3 border ${toast.type === "error" ? "bg-white border-rose-100 text-rose-800" : "bg-white border-accent-100 text-accent-800"
                            }`}
                    >
                        {toast.type === "error" ? <XCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-accent-500" />}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 group">
                                <Activity className="w-6 h-6 text-primary-600" />
                                <h1 className="text-xl font-bold text-slate-900">
                                    Clinic Admin
                                </h1>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-semibold text-slate-900">{user?.email?.split('@')[0]}</span>
                                <span className="text-xs text-slate-500">{user?.email}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-semibold transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area - Appointments */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-900">Appointments</h2>
                                <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {appointments.length} Total
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filter.status}
                                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <input
                                    type="date"
                                    value={filter.date}
                                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm font-medium text-slate-500">Loading appointments...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 text-center px-6">
                                <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-lg font-bold text-slate-900 mb-1">No appointments found</p>
                                <p className="text-sm text-slate-500">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {appointments.map((apt) => (
                                    <div
                                        key={apt._id}
                                        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-primary-500 transition-colors shadow-sm flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{apt.name}</h4>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {apt.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3 space-y-2 mb-4 border border-slate-100 text-sm">
                                            <div className="flex items-center justify-between font-medium text-slate-700">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                                                    {apt.date}
                                                </div>
                                                <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                                                    {apt.shift}
                                                </span>
                                            </div>
                                            {apt.confirmedTime && (
                                                <div className="flex items-center gap-2 text-primary-700 font-semibold bg-primary-100 px-2 py-1 rounded">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Confirmed at {apt.confirmedTime}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleModalOpen(apt)}
                                            className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-primary-600 transition-colors"
                                        >
                                            Manage Appointment
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side Column - Stats & Links */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-600" />
                                Daily Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                                    <div className="text-[10px] font-bold text-amber-600 uppercase">Pending</div>
                                    <div className="text-2xl font-bold text-amber-700">{stats.pending || 0}</div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Confirmed</div>
                                    <div className="text-2xl font-bold text-emerald-700">{stats.confirmed || 0}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                    <div className="text-[10px] font-bold text-blue-600 uppercase">Completed</div>
                                    <div className="text-2xl font-bold text-blue-700">{stats.completed || 0}</div>
                                </div>
                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                                    <div className="text-[10px] font-bold text-rose-600 uppercase">Cancelled</div>
                                    <div className="text-2xl font-bold text-rose-700">{stats.cancelled || 0}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary-600" />
                                Quick Links
                            </h3>
                            <Link href="/" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-slate-600" />
                                    <span className="font-medium text-sm text-slate-700">View Public Site</span>
                                </div>
                                <Activity className="w-4 h-4 text-slate-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal.show && modal.data && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
                            onClick={() => setModal({ show: false })}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Manage Appointment</h3>
                                    <p className="text-sm text-slate-500">Update status and confirm scheduling</p>
                                </div>
                                <button
                                    onClick={() => setModal({ show: false })}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-4">
                                {/* Patient Summary */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Patient</div>
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary-600" />
                                            {modal.data.name}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contact</div>
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-primary-600" />
                                            {modal.data.phone || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date & Time</div>
                                        <div className="font-semibold text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary-600" />
                                                {modal.data.date}
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">{modal.data.shift}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Status</div>
                                        <div>{getStatusBadge(modal.data.status)}</div>
                                    </div>

                                    {modal.data.message && (
                                        <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                            <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">Patient Message</div>
                                            <p className="text-sm text-slate-700 italic">"{modal.data.message}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section */}
                                <div className="border-t border-slate-200 pt-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Update Status</h4>

                                    {modal.data.status === 'pending' && (
                                        <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Assign Time (Optional)
                                            </label>
                                            <input
                                                type="time"
                                                value={confirmTime}
                                                onChange={(e) => setConfirmTime(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {modal.data.status !== 'confirmed' && modal.data.status !== 'completed' && (
                                            <button
                                                onClick={() => updateStatus(modal.data._id, "confirmed")}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "completed")}
                                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-lg transition-colors"
                                        >
                                            Complete
                                        </button>
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "cancelled")}
                                            className="flex-1 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold py-2 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-50 border-t border-slate-200 p-4 px-5 flex justify-between items-center">
                                <button
                                    onClick={() => deleteAppointment(modal.data._id)}
                                    className="text-rose-600 text-sm font-bold hover:underline flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Record
                                </button>
                                <button
                                    onClick={() => setModal({ show: false })}
                                    className="text-slate-500 text-sm font-bold hover:text-slate-900"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
